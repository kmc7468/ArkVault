import {
  sqliteTable,
  text,
  integer,
  foreignKey,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";
import { mek } from "./mek";
import { user } from "./user";

const ciphertext = (name: string) =>
  text(name, { mode: "json" }).$type<{
    ciphertext: string; // Base64
    iv: string; // Base64
  }>();

export const category = sqliteTable(
  "category",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    parentId: integer("parent_id").references((): AnySQLiteColumn => category.id, {
      onDelete: "cascade",
    }),
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

export const categoryLog = sqliteTable("category_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "cascade" }),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
  action: text("action", { enum: ["create", "rename"] }).notNull(),
  newName: ciphertext("new_name"),
});
