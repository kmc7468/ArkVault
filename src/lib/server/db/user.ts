import { eq } from "drizzle-orm";
import db from "./drizzle";
import { user } from "./schema";

export const getUser = async (userId: number) => {
  const users = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  return users[0] ?? null;
};

export const getUserByEmail = async (email: string) => {
  const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
  return users[0] ?? null;
};

export const setUserPassword = async (userId: number, password: string) => {
  await db.update(user).set({ password }).where(eq(user.id, userId));
};

export const setUserNickname = async (userId: number, nickname: string) => {
  await db.update(user).set({ nickname }).where(eq(user.id, userId));
};
