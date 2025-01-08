import { sqliteTable, text, integer, primaryKey, foreignKey } from "drizzle-orm/sqlite-core";
import { client } from "./client";
import { user } from "./user";

export const mek = sqliteTable(
  "master_encryption_key",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    version: integer("version").notNull(),
    createdBy: integer("created_by")
      .notNull()
      .references(() => client.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    state: text("state", { enum: ["active", "retired", "dead"] }).notNull(),
    retiredAt: integer("retired_at", { mode: "timestamp_ms" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.version] }),
  }),
);

export const clientMek = sqliteTable(
  "client_master_encryption_key",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    clientId: integer("client_id")
      .notNull()
      .references(() => client.id),
    mekVersion: integer("version").notNull(),
    encMek: text("encrypted_key").notNull(), // Base64
    encMekSig: text("encrypted_key_signature").notNull(), // Base64
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.clientId, t.mekVersion] }),
    ref: foreignKey({
      columns: [t.userId, t.mekVersion],
      foreignColumns: [mek.userId, mek.version],
    }),
  }),
);
