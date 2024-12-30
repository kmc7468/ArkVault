import { sqliteTable, text, integer, primaryKey, unique } from "drizzle-orm/sqlite-core";
import { user } from "./user";

export const client = sqliteTable(
  "client",
  {
    id: integer("id").primaryKey(),
    encPubKey: text("encryption_public_key").notNull().unique(), // Base64
    sigPubKey: text("signature_public_key").notNull().unique(), // Base64
  },
  (t) => ({
    unq: unique().on(t.encPubKey, t.sigPubKey),
  }),
);

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
  answer: text("challenge").notNull().unique(), // Base64
  allowedIp: text("allowed_ip").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  isUsed: integer("is_used", { mode: "boolean" }).notNull().default(false),
});
