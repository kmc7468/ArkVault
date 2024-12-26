import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { getClientByPubKey } from "$lib/server/db/client";
import { getUserByEmail } from "$lib/server/db/user";
import env from "$lib/server/loadenv";

interface TokenData {
  type: "access" | "refresh";
  userId: number;
  clientId?: number;
}

const verifyPassword = async (hash: string, password: string) => {
  return await argon2.verify(hash, password);
};

const issueToken = (type: "access" | "refresh", userId: number, clientId?: number) => {
  return jwt.sign(
    {
      type,
      userId,
      clientId,
    } satisfies TokenData,
    env.jwt.secret,
    {
      expiresIn: type === "access" ? env.jwt.accessExp : env.jwt.refreshExp,
    },
  );
};

export const login = async (email: string, password: string, pubKey?: string) => {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isValid = await verifyPassword(user.password, password);
  if (!isValid) return null;

  const client = pubKey ? await getClientByPubKey(pubKey) : null;

  return {
    accessToken: issueToken("access", user.id, client?.id),
    refreshToken: issueToken("refresh", user.id, client?.id),
  };
};
