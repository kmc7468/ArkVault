import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "$lib/server/db/user";
import env from "$lib/server/loadenv";

const verifyPassword = async (hash: string, password: string) => {
  return await argon2.verify(hash, password);
};

const issueToken = (id: number, type: "access" | "refresh") => {
  return jwt.sign({ id, type }, env.jwt.secret, {
    expiresIn: type === "access" ? env.jwt.accessExp : env.jwt.refreshExp,
  });
};

export const login = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await verifyPassword(user.password, password);
  if (!valid) return null;

  return {
    accessToken: issueToken(user.id, "access"),
    refreshToken: issueToken(user.id, "refresh"),
  };
};
