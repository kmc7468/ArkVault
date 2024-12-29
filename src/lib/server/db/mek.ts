import { and, or, eq, lt, desc } from "drizzle-orm";
import db from "./drizzle";
import { mek, clientMek, userClient } from "./schema";

export interface ClientMek {
  clientId: number;
  encMek: string;
}

export const registerInitialMek = async (userId: number, createdBy: number, encMek: string) => {
  await db.transaction(async (tx) => {
    await tx
      .insert(mek)
      .values({
        userId,
        version: 1,
        createdBy,
        createdAt: new Date(),
        state: "active",
      })
      .execute();
    await tx
      .insert(clientMek)
      .values({
        userId,
        clientId: createdBy,
        mekVersion: 1,
        encMek,
      })
      .execute();
  });
};

export const registerActiveMek = async (
  userId: number,
  version: number,
  createdBy: number,
  clientMeks: ClientMek[],
) => {
  await db.transaction(async (tx) => {
    // 1. Check if the clientMeks are valid
    const userClients = await tx
      .select()
      .from(userClient)
      .where(and(eq(userClient.userId, userId), eq(userClient.state, "active")));
    if (
      clientMeks.length !== userClients.length ||
      !clientMeks.every((clientMek) =>
        userClients.some((userClient) => userClient.clientId === clientMek.clientId),
      )
    ) {
      throw new Error("Invalid key list");
    }

    // 2. Retire the old active MEK and insert the new one
    await tx
      .update(mek)
      .set({
        state: "retired",
        retiredAt: new Date(),
      })
      .where(and(eq(mek.userId, userId), lt(mek.version, version), eq(mek.state, "active")))
      .execute();
    await tx
      .insert(mek)
      .values({
        userId,
        version,
        createdBy,
        createdAt: new Date(),
        state: "active",
      })
      .execute();

    // 3. Insert the new client MEKs
    await tx
      .insert(clientMek)
      .values(
        clientMeks.map(({ clientId, encMek }) => ({
          userId,
          clientId,
          mekVersion: version,
          encMek,
        })),
      )
      .execute();
  });
};

export const getInitialMek = async (userId: number) => {
  const meks = await db
    .select()
    .from(mek)
    .where(and(eq(mek.userId, userId), eq(mek.version, 1)))
    .execute();
  return meks[0] ?? null;
};

export const getNextActiveMekVersion = async (userId: number) => {
  const meks = await db
    .select({ version: mek.version })
    .from(mek)
    .where(eq(mek.userId, userId))
    .orderBy(desc(mek.version))
    .limit(1)
    .execute();
  if (!meks[0]) {
    throw new Error("No MEK found");
  }
  return meks[0].version + 1;
};

export const getAllValidClientMeks = async (userId: number, clientId: number) => {
  return await db
    .select()
    .from(clientMek)
    .innerJoin(mek, and(eq(clientMek.userId, mek.userId), eq(clientMek.mekVersion, mek.version)))
    .where(
      and(
        eq(clientMek.userId, userId),
        eq(clientMek.clientId, clientId),
        or(eq(mek.state, "active"), eq(mek.state, "retired")),
      ),
    )
    .execute();
};
