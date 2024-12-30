import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import env from "$lib/server/loadenv";

const client = new Database(env.databaseUrl);
const db = drizzle(client);

export const migrateDB = () => {
  if (process.env.NODE_ENV === "production") {
    migrate(db, { migrationsFolder: "./drizzle" });
  }
};

export default db;
