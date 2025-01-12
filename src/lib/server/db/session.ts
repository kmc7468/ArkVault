import { SqliteError } from "better-sqlite3";
import { and, eq, ne, gt, lte, isNull } from "drizzle-orm";
import env from "$lib/server/loadenv";
import db from "./drizzle";
import { IntegrityError } from "./error";
import { session, sessionUpgradeChallenge } from "./schema";

export const createSession = async (
  userId: number,
  clientId: number | null,
  sessionId: string,
  ip: string | null,
  userAgent: string | null,
) => {
  try {
    const now = new Date();
    await db.insert(session).values({
      id: sessionId,
      userId,
      clientId,
      createdAt: now,
      lastUsedAt: now,
      lastUsedByIp: ip || null,
      lastUsedByUserAgent: userAgent || null,
    });
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new IntegrityError("Session already exists");
    }
    throw e;
  }
};

export const refreshSession = async (
  sessionId: string,
  ip: string | null,
  userAgent: string | null,
) => {
  const now = new Date();
  const sessions = await db
    .update(session)
    .set({
      lastUsedAt: now,
      lastUsedByIp: ip || undefined,
      lastUsedByUserAgent: userAgent || undefined,
    })
    .where(
      and(
        eq(session.id, sessionId),
        gt(session.lastUsedAt, new Date(now.getTime() - env.session.exp)),
      ),
    )
    .returning({ userId: session.userId, clientId: session.clientId });
  if (!sessions[0]) {
    throw new IntegrityError("Session not found");
  }
  return sessions[0];
};

export const upgradeSession = async (sessionId: string, clientId: number) => {
  const res = await db
    .update(session)
    .set({ clientId })
    .where(and(eq(session.id, sessionId), isNull(session.clientId)));
  if (res.changes === 0) {
    throw new IntegrityError("Session not found");
  }
};

export const deleteSession = async (sessionId: string) => {
  await db.delete(session).where(eq(session.id, sessionId));
};

export const deleteAllOtherSessions = async (userId: number, sessionId: string) => {
  await db.delete(session).where(and(eq(session.userId, userId), ne(session.id, sessionId)));
};

export const cleanupExpiredSessions = async () => {
  await db.delete(session).where(lte(session.lastUsedAt, new Date(Date.now() - env.session.exp)));
};

export const registerSessionUpgradeChallenge = async (
  sessionId: string,
  clientId: number,
  answer: string,
  allowedIp: string,
  expiresAt: Date,
) => {
  try {
    await db.insert(sessionUpgradeChallenge).values({
      sessionId,
      clientId,
      answer,
      allowedIp,
      expiresAt,
    });
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new IntegrityError("Challenge already registered");
    }
    throw e;
  }
};

export const consumeSessionUpgradeChallenge = async (
  sessionId: string,
  answer: string,
  ip: string,
) => {
  const challenges = await db
    .delete(sessionUpgradeChallenge)
    .where(
      and(
        eq(sessionUpgradeChallenge.sessionId, sessionId),
        eq(sessionUpgradeChallenge.answer, answer),
        eq(sessionUpgradeChallenge.allowedIp, ip),
        gt(sessionUpgradeChallenge.expiresAt, new Date()),
      ),
    )
    .returning({ clientId: sessionUpgradeChallenge.clientId });
  return challenges[0] ?? null;
};

export const cleanupExpiredSessionUpgradeChallenges = async () => {
  await db
    .delete(sessionUpgradeChallenge)
    .where(lte(sessionUpgradeChallenge.expiresAt, new Date()));
};
