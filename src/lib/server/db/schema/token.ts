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
    expiresAt: integer("expires_at").notNull(), // Only used for cleanup
  },
  (t) => ({
    unq: unique().on(t.userId, t.clientId),
  }),
);
