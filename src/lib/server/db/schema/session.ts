import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { client } from "./client";
import { user } from "./user";

export const session = sqliteTable(
  "session",
  {
    id: text("id").notNull().primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    clientId: integer("client_id").references(() => client.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }).notNull(),
    lastUsedByIp: text("last_used_by_ip"),
    lastUsedByUserAgent: text("last_used_by_user_agent"),
  },
  (t) => ({
    unq: unique().on(t.userId, t.clientId),
  }),
);

export const sessionUpgradeChallenge = sqliteTable("session_upgrade_challenge", {
  id: integer("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => session.id)
    .unique(),
  clientId: integer("client_id")
    .notNull()
    .references(() => client.id),
  answer: text("answer").notNull().unique(), // Base64
  allowedIp: text("allowed_ip").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});
