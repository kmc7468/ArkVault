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
    state: text("state", { enum: ["pending", "active", "retired", "dead"] })
      .notNull()
      .default("pending"),
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
    mekVersion: integer("master_encryption_key_version").notNull(),
    encMek: text("encrypted_master_encryption_key").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.clientId, t.mekVersion] }),
    ref: foreignKey({
      columns: [t.userId, t.mekVersion],
      foreignColumns: [mek.userId, mek.version],
    }),
  }),
);

export const mekChallenge = sqliteTable(
  "master_encryption_key_challenge",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    mekVersion: integer("master_encryption_key_version").notNull(),
    answer: text("answer").notNull().unique(), // Base64
    challenge: text("challenge").unique(), // Base64
    allowedIp: text("allowed_ip").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.mekVersion] }),
    ref: foreignKey({
      columns: [t.userId, t.mekVersion],
      foreignColumns: [mek.userId, mek.version],
    }),
  }),
);
