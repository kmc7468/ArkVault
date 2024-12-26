import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const revokedToken = sqliteTable("revoked_token", {
  id: integer("id").primaryKey(),
  token: text("token").notNull().unique(),
  revokedAt: integer("revoked_at").notNull(),
});
