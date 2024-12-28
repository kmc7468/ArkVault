import { error } from "@sveltejs/kit";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { getClientByPubKey, getUserClient } from "$lib/server/db/client";
import { getUserByEmail } from "$lib/server/db/user";
import {
  getRefreshToken,
  registerRefreshToken,
  rotateRefreshToken,
  upgradeRefreshToken,
  revokeRefreshToken,
} from "$lib/server/db/token";
import { UserClientState } from "$lib/server/db/schema";
import { issueToken, verifyToken, TokenError } from "$lib/server/modules/auth";

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

export const login = async (email: string, password: string, pubKey?: string) => {
  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(user.password, password))) {
    error(401, "Invalid email or password");
  }

  const client = pubKey ? await getClientByPubKey(pubKey) : undefined;
  const userClient = client ? await getUserClient(user.id, client.id) : undefined;
  if (client === null) {
    error(401, "Invalid public key");
  } else if (client && (!userClient || userClient.state === UserClientState.Challenging)) {
    error(401, "Unregistered public key");
  }

  return {
    accessToken: issueAccessToken(user.id, client?.id),
    refreshToken: await issueRefreshToken(user.id, client?.id),
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

export const refreshTokens = async (refreshToken: string) => {
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

export const upgradeTokens = async (refreshToken: string, pubKey: string) => {
  const { jti: oldJti, userId, clientId } = await verifyRefreshToken(refreshToken);
  if (clientId) {
    error(403, "Forbidden");
  }

  const client = await getClientByPubKey(pubKey);
  const userClient = client ? await getUserClient(userId, client.id) : undefined;
  if (!client) {
    error(401, "Invalid public key");
  } else if (client && (!userClient || userClient.state === UserClientState.Challenging)) {
    error(401, "Unregistered public key");
  }

  const newJti = uuidv4();
  if (!(await upgradeRefreshToken(oldJti, newJti, client.id))) {
    error(500, "Refresh token not found");
  }
  return {
    accessToken: issueAccessToken(userId, client.id),
    refreshToken: issueToken({ type: "refresh", jti: newJti }),
  };
};
