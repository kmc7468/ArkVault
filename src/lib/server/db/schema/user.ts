import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { Generated } from "kysely";

export const user = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  nickname: text("nickname").notNull(),
});

interface UserTable {
  id: Generated<number>;
  email: string;
  nickname: string;
  password: string;
}

declare module "./index" {
  interface Database {
    user: UserTable;
  }
}
