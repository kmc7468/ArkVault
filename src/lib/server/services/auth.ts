import { error } from "@sveltejs/kit";
import argon2 from "argon2";
import { getClientByPubKey } from "$lib/server/db/client";
import { getUserByEmail, revokeToken, isTokenRevoked } from "$lib/server/db/user";
import { issueToken, verifyToken, TokenError } from "$lib/server/modules/auth";

const verifyPassword = async (hash: string, password: string) => {
  return await argon2.verify(hash, password);
};

export const login = async (email: string, password: string, pubKey?: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    error(401, "Invalid email or password");
  }

  const isValid = await verifyPassword(user.password, password);
  if (!isValid) {
    error(401, "Invalid email or password");
  }

  const client = pubKey ? await getClientByPubKey(pubKey) : undefined;
  if (client === null) {
    error(401, "Invalid public key");
  }

  return {
    accessToken: issueToken("access", user.id, client?.id),
    refreshToken: issueToken("refresh", user.id, client?.id),
  };
};

const verifyRefreshToken = async (refreshToken: string) => {
  const tokenData = verifyToken(refreshToken);
  if (tokenData === TokenError.EXPIRED) {
    error(401, "Token expired");
  } else if (
    tokenData === TokenError.INVALID ||
    tokenData.type !== "refresh" ||
    (await isTokenRevoked(refreshToken))
  ) {
    error(401, "Invalid token");
  }
  return tokenData;
};

export const logout = async (refreshToken: string) => {
  await verifyRefreshToken(refreshToken);
  await revokeToken(refreshToken);
};

export const refreshToken = async (refreshToken: string) => {
  const tokenData = await verifyRefreshToken(refreshToken);

  await revokeToken(refreshToken);
  return {
    accessToken: issueToken("access", tokenData.userId, tokenData.clientId),
    refreshToken: issueToken("refresh", tokenData.userId, tokenData.clientId),
  };
};
