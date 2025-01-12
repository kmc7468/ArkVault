import { SqliteError } from "better-sqlite3";
import { and, eq } from "drizzle-orm";
import db from "./drizzle";
import { IntegrityError } from "./error";
import { hsk, hskLog } from "./schema";

export const registerInitialHsk = async (
  userId: number,
  createdBy: number,
  mekVersion: number,
  encHsk: string,
) => {
  await db.transaction(
    async (tx) => {
      try {
        await tx.insert(hsk).values({
          userId,
          version: 1,
          state: "active",
          mekVersion,
          encHsk,
        });
        await tx.insert(hskLog).values({
          userId,
          hskVersion: 1,
          timestamp: new Date(),
          action: "create",
          actionBy: createdBy,
        });
      } catch (e) {
        if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
          throw new IntegrityError("HSK already registered");
        }
      }
    },
    { behavior: "exclusive" },
  );
};

export const getAllValidHsks = async (userId: number) => {
  return await db
    .select()
    .from(hsk)
    .where(and(eq(hsk.userId, userId), eq(hsk.state, "active")));
};
