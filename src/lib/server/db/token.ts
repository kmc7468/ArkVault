import { SqliteError } from "better-sqlite3";
import { and, eq, gt, lte } from "drizzle-orm";
import env from "$lib/server/loadenv";
import db from "./drizzle";
import { IntegrityError } from "./error";
import { refreshToken, tokenUpgradeChallenge } from "./schema";

const expiresAt = () => new Date(Date.now() + env.jwt.refreshExp);

export const registerRefreshToken = async (
  userId: number,
  clientId: number | null,
  tokenId: string,
) => {
  try {
    await db.insert(refreshToken).values({
      id: tokenId,
      userId,
      clientId,
      expiresAt: expiresAt(),
    });
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new IntegrityError("Refresh token already registered");
    }
    throw e;
  }
};

export const getRefreshToken = async (tokenId: string) => {
  const tokens = await db.select().from(refreshToken).where(eq(refreshToken.id, tokenId)).limit(1);
  return tokens[0] ?? null;
};

export const rotateRefreshToken = async (oldTokenId: string, newTokenId: string) => {
  await db.transaction(
    async (tx) => {
      await tx
        .delete(tokenUpgradeChallenge)
        .where(eq(tokenUpgradeChallenge.refreshTokenId, oldTokenId));

      const res = await tx
        .update(refreshToken)
        .set({
          id: newTokenId,
          expiresAt: expiresAt(),
        })
        .where(eq(refreshToken.id, oldTokenId));
      if (res.changes === 0) {
        throw new IntegrityError("Refresh token not found");
      }
    },
    { behavior: "exclusive" },
  );
};

export const upgradeRefreshToken = async (
  oldTokenId: string,
  newTokenId: string,
  clientId: number,
) => {
  await db.transaction(
    async (tx) => {
      await tx
        .delete(tokenUpgradeChallenge)
        .where(eq(tokenUpgradeChallenge.refreshTokenId, oldTokenId));

      const res = await tx
        .update(refreshToken)
        .set({
          id: newTokenId,
          clientId,
          expiresAt: expiresAt(),
        })
        .where(eq(refreshToken.id, oldTokenId));
      if (res.changes === 0) {
        throw new IntegrityError("Refresh token not found");
      }
    },
    { behavior: "exclusive" },
  );
};

export const revokeRefreshToken = async (tokenId: string) => {
  await db.delete(refreshToken).where(eq(refreshToken.id, tokenId));
};

export const cleanupExpiredRefreshTokens = async () => {
  await db.delete(refreshToken).where(lte(refreshToken.expiresAt, new Date()));
};

export const registerTokenUpgradeChallenge = async (
  tokenId: string,
  clientId: number,
  answer: string,
  allowedIp: string,
  expiresAt: Date,
) => {
  await db.insert(tokenUpgradeChallenge).values({
    refreshTokenId: tokenId,
    clientId,
    answer,
    allowedIp,
    expiresAt,
  });
};

export const getTokenUpgradeChallenge = async (answer: string, ip: string) => {
  const challenges = await db
    .select()
    .from(tokenUpgradeChallenge)
    .where(
      and(
        eq(tokenUpgradeChallenge.answer, answer),
        eq(tokenUpgradeChallenge.allowedIp, ip),
        gt(tokenUpgradeChallenge.expiresAt, new Date()),
        eq(tokenUpgradeChallenge.isUsed, false),
      ),
    )
    .limit(1);
  return challenges[0] ?? null;
};

export const markTokenUpgradeChallengeAsUsed = async (id: number) => {
  await db
    .update(tokenUpgradeChallenge)
    .set({ isUsed: true })
    .where(eq(tokenUpgradeChallenge.id, id));
};

export const cleanupExpiredTokenUpgradeChallenges = async () => {
  await db.delete(tokenUpgradeChallenge).where(lte(tokenUpgradeChallenge.expiresAt, new Date()));
};
