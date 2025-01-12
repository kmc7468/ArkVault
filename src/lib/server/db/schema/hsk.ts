import { sqliteTable, text, integer, primaryKey, foreignKey } from "drizzle-orm/sqlite-core";
import { mek } from "./mek";
import { user } from "./user";

export const hsk = sqliteTable(
  "hmac_secret_key",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    version: integer("version").notNull(),
    state: text("state", { enum: ["active"] }).notNull(),
    mekVersion: integer("master_encryption_key_version").notNull(),
    encHsk: text("encrypted_key").notNull().unique(), // Base64
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.version] }),
    ref: foreignKey({
      columns: [t.userId, t.mekVersion],
      foreignColumns: [mek.userId, mek.version],
    }),
  }),
);

export const hskLog = sqliteTable(
  "hmac_secret_key_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    hskVersion: integer("hmac_secret_key_version").notNull(),
    timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
    action: text("action", { enum: ["create"] }).notNull(),
    actionBy: integer("action_by").references(() => user.id),
  },
  (t) => ({
    ref: foreignKey({
      columns: [t.userId, t.hskVersion],
      foreignColumns: [hsk.userId, hsk.version],
    }),
  }),
);
