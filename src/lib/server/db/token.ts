import { SqliteError } from "better-sqlite3";
import { eq, lte } from "drizzle-orm";
import ms from "ms";
import env from "$lib/server/loadenv";
import db from "./drizzle";
import { refreshToken } from "./schema";

const expiresIn = ms(env.jwt.refreshExp);
const expiresAt = () => new Date(Date.now() + expiresIn);

export const registerRefreshToken = async (
  userId: number,
  clientId: number | null,
  tokenId: string,
) => {
  try {
    await db
      .insert(refreshToken)
      .values({
        id: tokenId,
        userId,
        clientId,
        expiresAt: expiresAt(),
      })
      .execute();
    return true;
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return false;
    }
    throw e;
  }
};

export const getRefreshToken = async (tokenId: string) => {
  const tokens = await db.select().from(refreshToken).where(eq(refreshToken.id, tokenId)).execute();
  return tokens[0] ?? null;
};

export const rotateRefreshToken = async (oldTokenId: string, newTokenId: string) => {
  const res = await db
    .update(refreshToken)
    .set({
      id: newTokenId,
      expiresAt: expiresAt(),
    })
    .where(eq(refreshToken.id, oldTokenId))
    .execute();
  return res.changes > 0;
};

export const upgradeRefreshToken = async (
  oldTokenId: string,
  newTokenId: string,
  clientId: number,
) => {
  const res = await db
    .update(refreshToken)
    .set({
      id: newTokenId,
      clientId,
      expiresAt: expiresAt(),
    })
    .where(eq(refreshToken.id, oldTokenId))
    .execute();
  return res.changes > 0;
};

export const revokeRefreshToken = async (tokenId: string) => {
  await db.delete(refreshToken).where(eq(refreshToken.id, tokenId)).execute();
};

export const cleanupExpiredRefreshTokens = async () => {
  await db.delete(refreshToken).where(lte(refreshToken.expiresAt, new Date())).execute();
};
