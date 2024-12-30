import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { client } from "./client";
import { user } from "./user";

export const refreshToken = sqliteTable(
  "refresh_token",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    clientId: integer("client_id").references(() => client.id),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(), // Only used for cleanup
  },
  (t) => ({
    unq: unique().on(t.userId, t.clientId),
  }),
);

export const tokenUpgradeChallenge = sqliteTable("token_upgrade_challenge", {
  id: integer("id").primaryKey(),
  refreshTokenId: text("refresh_token_id")
    .notNull()
    .references(() => refreshToken.id),
  clientId: integer("client_id")
    .notNull()
    .references(() => client.id),
  answer: text("challenge").notNull().unique(), // Base64
  allowedIp: text("allowed_ip").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});
