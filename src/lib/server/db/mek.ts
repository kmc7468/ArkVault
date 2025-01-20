import pg from "pg";
import { IntegrityError } from "./error";
import db from "./kysely";
import type { MekState } from "./schema";

interface Mek {
  userId: number;
  version: number;
  state: MekState;
}

interface ClientMekWithDetails extends Mek {
  clientId: number;
  encMek: string;
  encMekSig: string;
}

export const registerInitialMek = async (
  userId: number,
  createdBy: number,
  encMek: string,
  encMekSig: string,
) => {
  await db.transaction().execute(async (trx) => {
    try {
      await trx
        .insertInto("master_encryption_key")
        .values({
          user_id: userId,
          version: 1,
          state: "active",
        })
        .execute();
      await trx
        .insertInto("client_master_encryption_key")
        .values({
          user_id: userId,
          client_id: createdBy,
          version: 1,
          encrypted_key: encMek,
          encrypted_key_signature: encMekSig,
        })
        .execute();
      await trx
        .insertInto("master_encryption_key_log")
        .values({
          user_id: userId,
          master_encryption_key_version: 1,
          timestamp: new Date(),
          action: "create",
          action_by: createdBy,
        })
        .execute();
    } catch (e) {
      if (e instanceof pg.DatabaseError && e.code === "23505") {
        throw new IntegrityError("MEK already registered");
      }
      throw e;
    }
  });
};

export const getInitialMek = async (userId: number) => {
  const mek = await db
    .selectFrom("master_encryption_key")
    .selectAll()
    .where("user_id", "=", userId)
    .where("version", "=", 1)
    .limit(1)
    .executeTakeFirst();
  return mek
    ? ({ userId: mek.user_id, version: mek.version, state: mek.state } satisfies Mek)
    : null;
};

export const getAllValidClientMeks = async (userId: number, clientId: number) => {
  const clientMeks = await db
    .selectFrom("client_master_encryption_key")
    .innerJoin("master_encryption_key", (join) =>
      join
        .onRef("client_master_encryption_key.user_id", "=", "master_encryption_key.user_id")
        .onRef("client_master_encryption_key.version", "=", "master_encryption_key.version"),
    )
    .selectAll()
    .where("user_id", "=", userId)
    .where("client_id", "=", clientId)
    .where((eb) => eb.or([eb("state", "=", "active"), eb("state", "=", "retired")]))
    .execute();
  return clientMeks.map(
    ({ user_id, client_id, version, state, encrypted_key, encrypted_key_signature }) =>
      ({
        userId: user_id,
        version,
        state: state as "active" | "retired",
        clientId: client_id,
        encMek: encrypted_key,
        encMekSig: encrypted_key_signature,
      }) satisfies ClientMekWithDetails,
  );
};
