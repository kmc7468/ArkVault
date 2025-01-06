import { sqliteTable, text, integer, foreignKey } from "drizzle-orm/sqlite-core";
import { mek } from "./mek";
import { user } from "./user";

const ciphertext = (name: string) =>
  text(name, { mode: "json" }).$type<{
    ciphertext: string; // Base64
    iv: string; // Base64
  }>();

export const directory = sqliteTable(
  "directory",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    parentId: integer("parent_id"),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    mekVersion: integer("master_encryption_key_version").notNull(),
    encDek: text("encrypted_data_encryption_key").notNull().unique(), // Base64
    dekVersion: integer("data_encryption_key_version", { mode: "timestamp_ms" }).notNull(),
    encName: ciphertext("encrypted_name").notNull(),
  },
  (t) => ({
    ref1: foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
    }),
    ref2: foreignKey({
      columns: [t.userId, t.mekVersion],
      foreignColumns: [mek.userId, mek.version],
    }),
  }),
);

export const file = sqliteTable(
  "file",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    path: text("path").notNull().unique(),
    parentId: integer("parent_id").references(() => directory.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    mekVersion: integer("master_encryption_key_version").notNull(),
    encDek: text("encrypted_data_encryption_key").notNull().unique(), // Base64
    dekVersion: integer("data_encryption_key_version", { mode: "timestamp_ms" }).notNull(),
    contentType: text("content_type").notNull(),
    encContentIv: text("encrypted_content_iv").notNull(), // Base64
    encName: ciphertext("encrypted_name").notNull(),
  },
  (t) => ({
    ref: foreignKey({
      columns: [t.userId, t.mekVersion],
      foreignColumns: [mek.userId, mek.version],
    }),
  }),
);
