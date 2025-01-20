import { DatabaseError } from "pg";
import { IntegrityError } from "./error";
import db from "./kysely";
import type { HskState } from "./schema";

interface Hsk {
  userId: number;
  version: number;
  state: HskState;
  mekVersion: number;
  encHsk: string;
}

export const registerInitialHsk = async (
  userId: number,
  createdBy: number,
  mekVersion: number,
  encHsk: string,
) => {
  await db.transaction().execute(async (trx) => {
    try {
      await trx
        .insertInto("hmac_secret_key")
        .values({
          user_id: userId,
          version: 1,
          state: "active",
          master_encryption_key_version: mekVersion,
          encrypted_key: encHsk,
        })
        .execute();
      await trx
        .insertInto("hmac_secret_key_log")
        .values({
          user_id: userId,
          hmac_secret_key_version: 1,
          timestamp: new Date(),
          action: "create",
          action_by: createdBy,
        })
        .execute();
    } catch (e) {
      if (e instanceof DatabaseError && e.code === "23505") {
        throw new IntegrityError("HSK already registered");
      }
      throw e;
    }
  });
};

export const getAllValidHsks = async (userId: number) => {
  const hsks = await db
    .selectFrom("hmac_secret_key")
    .selectAll()
    .where("user_id", "=", userId)
    .where("state", "=", "active")
    .execute();
  return hsks.map(
    ({ user_id, version, state, master_encryption_key_version, encrypted_key }) =>
      ({
        userId: user_id,
        version,
        state: state as "active",
        mekVersion: master_encryption_key_version,
        encHsk: encrypted_key,
      }) satisfies Hsk,
  );
};
