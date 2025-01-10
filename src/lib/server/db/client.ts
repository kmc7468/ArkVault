import { SqliteError } from "better-sqlite3";
import { and, or, eq, gt, lte } from "drizzle-orm";
import db from "./drizzle";
import { IntegrityError } from "./error";
import { client, userClient, userClientChallenge } from "./schema";

export const createClient = async (encPubKey: string, sigPubKey: string, userId: number) => {
  return await db.transaction(
    async (tx) => {
      const clients = await tx
        .select({ id: client.id })
        .from(client)
        .where(or(eq(client.encPubKey, sigPubKey), eq(client.sigPubKey, encPubKey)))
        .limit(1);
      if (clients.length !== 0) {
        throw new IntegrityError("Public key(s) already registered");
      }

      const newClients = await tx
        .insert(client)
        .values({ encPubKey, sigPubKey })
        .returning({ id: client.id });
      const { id: clientId } = newClients[0]!;
      await tx.insert(userClient).values({ userId, clientId });

      return clientId;
    },
    { behavior: "exclusive" },
  );
};

export const getClient = async (clientId: number) => {
  const clients = await db.select().from(client).where(eq(client.id, clientId)).limit(1);
  return clients[0] ?? null;
};

export const getClientByPubKeys = async (encPubKey: string, sigPubKey: string) => {
  const clients = await db
    .select()
    .from(client)
    .where(and(eq(client.encPubKey, encPubKey), eq(client.sigPubKey, sigPubKey)))
    .limit(1);
  return clients[0] ?? null;
};

export const createUserClient = async (userId: number, clientId: number) => {
  try {
    await db.insert(userClient).values({ userId, clientId });
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      throw new IntegrityError("User client already exists");
    }
    throw e;
  }
};

export const getAllUserClients = async (userId: number) => {
  return await db.select().from(userClient).where(eq(userClient.userId, userId));
};

export const getUserClient = async (userId: number, clientId: number) => {
  const userClients = await db
    .select()
    .from(userClient)
    .where(and(eq(userClient.userId, userId), eq(userClient.clientId, clientId)))
    .limit(1);
  return userClients[0] ?? null;
};

export const getUserClientWithDetails = async (userId: number, clientId: number) => {
  const userClients = await db
    .select()
    .from(userClient)
    .innerJoin(client, eq(userClient.clientId, client.id))
    .where(and(eq(userClient.userId, userId), eq(userClient.clientId, clientId)))
    .limit(1);
  return userClients[0] ?? null;
};

export const setUserClientStateToPending = async (userId: number, clientId: number) => {
  await db
    .update(userClient)
    .set({ state: "pending" })
    .where(
      and(
        eq(userClient.userId, userId),
        eq(userClient.clientId, clientId),
        eq(userClient.state, "challenging"),
      ),
    );
};

export const setUserClientStateToActive = async (userId: number, clientId: number) => {
  await db
    .update(userClient)
    .set({ state: "active" })
    .where(
      and(
        eq(userClient.userId, userId),
        eq(userClient.clientId, clientId),
        eq(userClient.state, "pending"),
      ),
    );
};

export const registerUserClientChallenge = async (
  userId: number,
  clientId: number,
  answer: string,
  allowedIp: string,
  expiresAt: Date,
) => {
  await db.insert(userClientChallenge).values({
    userId,
    clientId,
    answer,
    allowedIp,
    expiresAt,
  });
};

export const getUserClientChallenge = async (answer: string, ip: string) => {
  const challenges = await db
    .select()
    .from(userClientChallenge)
    .where(
      and(
        eq(userClientChallenge.answer, answer),
        eq(userClientChallenge.allowedIp, ip),
        gt(userClientChallenge.expiresAt, new Date()),
        eq(userClientChallenge.isUsed, false),
      ),
    )
    .limit(1);
  return challenges[0] ?? null;
};

export const markUserClientChallengeAsUsed = async (id: number) => {
  await db.update(userClientChallenge).set({ isUsed: true }).where(eq(userClientChallenge.id, id));
};

export const cleanupExpiredUserClientChallenges = async () => {
  await db.delete(userClientChallenge).where(lte(userClientChallenge.expiresAt, new Date()));
};
