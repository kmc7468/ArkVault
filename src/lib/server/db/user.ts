import { eq } from "drizzle-orm";
import db from "./drizzle";
import { user, revokedToken } from "./schema";

export const getUserByEmail = async (email: string) => {
  const users = await db.select().from(user).where(eq(user.email, email)).execute();
  return users[0] ?? null;
};

export const revokeToken = async (token: string) => {
  await db
    .insert(revokedToken)
    .values({
      token,
      revokedAt: Date.now(),
    })
    .execute();
};

export const isTokenRevoked = async (token: string) => {
  const tokens = await db
    .select()
    .from(revokedToken)
    .where(eq(revokedToken.token, token))
    .execute();
  return tokens.length > 0;
};
