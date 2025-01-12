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

export const directoryLog = sqliteTable("directory_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  directoryId: integer("directory_id")
    .notNull()
    .references(() => directory.id, { onDelete: "cascade" }),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
  action: text("action", { enum: ["create", "rename"] }).notNull(),
  newName: ciphertext("new_name"),
});

export const file = sqliteTable(
  "file",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    parentId: integer("parent_id").references(() => directory.id),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    path: text("path").notNull().unique(),
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

export const fileLog = sqliteTable("file_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fileId: integer("file_id")
    .notNull()
    .references(() => file.id, { onDelete: "cascade" }),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
  action: text("action", { enum: ["create", "rename"] }).notNull(),
  newName: ciphertext("new_name"),
});
