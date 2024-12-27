import { and, eq } from "drizzle-orm";
import db from "./drizzle";
import { client, userClient } from "./schema";

export const createClient = async (pubKey: string, userId: number) => {
  await db.transaction(async (tx) => {
    const insertRes = await tx.insert(client).values({ pubKey }).returning({ id: client.id });
    const { id: clientId } = insertRes[0]!;
    await tx.insert(userClient).values({ userId, clientId });
  });
};

export const getClientByPubKey = async (pubKey: string) => {
  const clients = await db.select().from(client).where(eq(client.pubKey, pubKey)).execute();
  return clients[0] ?? null;
};

export const getUserClient = async (userId: number, clientId: number) => {
  const userClients = await db
    .select()
    .from(userClient)
    .where(and(eq(userClient.userId, userId), eq(userClient.clientId, clientId)))
    .execute();
  return userClients[0] ?? null;
};
