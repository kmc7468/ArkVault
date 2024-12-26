import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./user";

export enum UserClientState {
  PENDING = 0,
  ACTIVE = 1,
}

export const client = sqliteTable("client", {
  id: integer("id").primaryKey(),
  pubKey: text("public_key").notNull().unique(),
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
    state: integer("state").notNull().default(0),
    encKey: text("encrypted_key"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.clientId] }),
  }),
);
