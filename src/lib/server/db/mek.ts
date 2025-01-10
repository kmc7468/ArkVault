import { SqliteError } from "better-sqlite3";
import { and, or, eq } from "drizzle-orm";
import db from "./drizzle";
import { IntegrityError } from "./error";
import { mek, clientMek } from "./schema";

export const registerInitialMek = async (
  userId: number,
  createdBy: number,
  encMek: string,
  encMekSig: string,
) => {
  await db.transaction(
    async (tx) => {
      try {
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
      } catch (e) {
        if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
          throw new IntegrityError("MEK already registered");
        }
        throw e;
      }
    },
    { behavior: "exclusive" },
  );
};

export const getInitialMek = async (userId: number) => {
  const meks = await db
    .select()
    .from(mek)
    .where(and(eq(mek.userId, userId), eq(mek.version, 1)))
    .limit(1);
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
    );
};
