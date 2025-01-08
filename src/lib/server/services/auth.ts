import { error } from "@sveltejs/kit";
import argon2 from "argon2";
import ms from "ms";
import { v4 as uuidv4 } from "uuid";
import { getClient, getClientByPubKeys, getUserClient } from "$lib/server/db/client";
import { getUserByEmail } from "$lib/server/db/user";
import env from "$lib/server/loadenv";
import {
  getRefreshToken,
  registerRefreshToken,
  rotateRefreshToken,
  upgradeRefreshToken,
  revokeRefreshToken,
  registerTokenUpgradeChallenge,
  getTokenUpgradeChallenge,
  markTokenUpgradeChallengeAsUsed,
} from "$lib/server/db/token";
import { issueToken, verifyToken, TokenError } from "$lib/server/modules/auth";
import { verifySignature, generateChallenge } from "$lib/server/modules/crypto";

const verifyPassword = async (hash: string, password: string) => {
  return await argon2.verify(hash, password);
};

const issueAccessToken = (userId: number, clientId?: number) => {
  return issueToken({ type: "access", userId, clientId });
};

const issueRefreshToken = async (userId: number, clientId?: number) => {
  const jti = uuidv4();
  const token = issueToken({ type: "refresh", jti });

  if (!(await registerRefreshToken(userId, clientId ?? null, jti))) {
    error(403, "Already logged in");
  }
  return token;
};

export const login = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(user.password, password))) {
    error(401, "Invalid email or password");
  }

  return {
    accessToken: issueAccessToken(user.id),
    refreshToken: await issueRefreshToken(user.id),
  };
};

const verifyRefreshToken = async (refreshToken: string) => {
  const tokenPayload = verifyToken(refreshToken);
  if (tokenPayload === TokenError.EXPIRED) {
    error(401, "Refresh token expired");
  } else if (tokenPayload === TokenError.INVALID || tokenPayload.type !== "refresh") {
    error(401, "Invalid refresh token");
  }

  const tokenData = await getRefreshToken(tokenPayload.jti);
  if (!tokenData) {
    error(500, "Refresh token not found");
  }

  return {
    jti: tokenPayload.jti,
    userId: tokenData.userId,
    clientId: tokenData.clientId ?? undefined,
  };
};

export const logout = async (refreshToken: string) => {
  const { jti } = await verifyRefreshToken(refreshToken);
  await revokeRefreshToken(jti);
};

export const refreshToken = async (refreshToken: string) => {
  const { jti: oldJti, userId, clientId } = await verifyRefreshToken(refreshToken);
  const newJti = uuidv4();

  if (!(await rotateRefreshToken(oldJti, newJti))) {
    error(500, "Refresh token not found");
  }
  return {
    accessToken: issueAccessToken(userId, clientId),
    refreshToken: issueToken({ type: "refresh", jti: newJti }),
  };
};

const expiresIn = ms(env.challenge.tokenUpgradeExp);
const expiresAt = () => new Date(Date.now() + expiresIn);

const createChallenge = async (
  ip: string,
  tokenId: string,
  clientId: number,
  encPubKey: string,
) => {
  const { answer, challenge } = await generateChallenge(32, encPubKey);
  await registerTokenUpgradeChallenge(
    tokenId,
    clientId,
    answer.toString("base64"),
    ip,
    expiresAt(),
  );
  return challenge.toString("base64");
};

export const createTokenUpgradeChallenge = async (
  refreshToken: string,
  ip: string,
  encPubKey: string,
  sigPubKey: string,
) => {
  const { jti, userId, clientId } = await verifyRefreshToken(refreshToken);
  if (clientId) {
    error(403, "Forbidden");
  }

  const client = await getClientByPubKeys(encPubKey, sigPubKey);
  const userClient = client ? await getUserClient(userId, client.id) : undefined;
  if (!client) {
    error(401, "Invalid public key(s)");
  } else if (!userClient || userClient.state === "challenging") {
    error(401, "Unregistered client");
  }

  return { challenge: await createChallenge(ip, jti, client.id, encPubKey) };
};

export const upgradeToken = async (
  refreshToken: string,
  ip: string,
  answer: string,
  answerSig: string,
) => {
  const { jti: oldJti, userId, clientId } = await verifyRefreshToken(refreshToken);
  if (clientId) {
    error(403, "Forbidden");
  }

  const challenge = await getTokenUpgradeChallenge(answer, ip);
  if (!challenge) {
    error(401, "Invalid challenge answer");
  } else if (challenge.refreshTokenId !== oldJti) {
    error(403, "Forbidden");
  }

  const client = await getClient(challenge.clientId);
  if (!client) {
    error(500, "Invalid challenge answer");
  } else if (!verifySignature(Buffer.from(answer, "base64"), answerSig, client.sigPubKey)) {
    error(401, "Invalid challenge answer signature");
  }

  await markTokenUpgradeChallengeAsUsed(challenge.id);

  const newJti = uuidv4();
  if (!(await upgradeRefreshToken(oldJti, newJti, client.id))) {
    error(500, "Refresh token not found");
  }
  return {
    accessToken: issueAccessToken(userId, client.id),
    refreshToken: issueToken({ type: "refresh", jti: newJti }),
  };
};
