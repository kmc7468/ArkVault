import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  foreignKey,
  unique,
} from "drizzle-orm/sqlite-core";
import type { ColumnType, Generated } from "kysely";
import { user } from "./user";

export const client = sqliteTable(
  "client",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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

export const userClientChallenge = sqliteTable(
  "user_client_challenge",
  {
    id: integer("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    clientId: integer("client_id")
      .notNull()
      .references(() => client.id),
    answer: text("answer").notNull().unique(), // Base64
    allowedIp: text("allowed_ip").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    ref: foreignKey({
      columns: [t.userId, t.clientId],
      foreignColumns: [userClient.userId, userClient.clientId],
    }),
  }),
);

interface ClientTable {
  id: Generated<number>;
  encryption_public_key: string; // Base64
  signature_public_key: string; // Base64
}

export type UserClientState = "challenging" | "pending" | "active";

interface UserClientTable {
  user_id: number;
  client_id: number;
  state: ColumnType<UserClientState, UserClientState | undefined>;
}

interface UserClientChallengeTable {
  id: Generated<number>;
  user_id: number;
  client_id: number;
  answer: string; // Base64
  allowed_ip: string;
  expires_at: ColumnType<Date, Date, never>;
}

declare module "./index" {
  interface Database {
    client: ClientTable;
    user_client: UserClientTable;
    user_client_challenge: UserClientChallengeTable;
  }
}
