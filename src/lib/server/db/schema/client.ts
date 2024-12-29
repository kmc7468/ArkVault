import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./user";

export const client = sqliteTable("client", {
  id: integer("id").primaryKey(),
  pubKey: text("public_key").notNull().unique(), // Base64
});

export const userClient = sqliteTable(
  "user_client",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    clientId: integer("client_id")
      .notNull()
      .references(() => client.id),
    state: text("state", { enum: ["challenging", "pending", "active"] })
      .notNull()
      .default("challenging"),
    encKey: text("encrypted_key"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.clientId] }),
  }),
);

export const userClientChallenge = sqliteTable("user_client_challenge", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  clientId: integer("client_id")
    .notNull()
    .references(() => client.id),
  challenge: text("challenge").notNull().unique(), // Base64
  allowedIp: text("allowed_ip").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});
