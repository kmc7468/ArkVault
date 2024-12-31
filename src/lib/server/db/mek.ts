import { and, or, eq } from "drizzle-orm";
import db from "./drizzle";
import { mek, clientMek } from "./schema";

export const registerInitialMek = async (
  userId: number,
  createdBy: number,
  encMek: string,
  encMekSig: string,
) => {
  await db.transaction(async (tx) => {
    await tx.insert(mek).values({
      userId,
      version: 1,
      createdBy,
      createdAt: new Date(),
      state: "active",
    });
    await tx.insert(clientMek).values({
      userId,
      clientId: createdBy,
      mekVersion: 1,
      encMek,
      encMekSig,
    });
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
