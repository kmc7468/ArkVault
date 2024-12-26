import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import env from "$lib/server/loadenv";

const client = new Database(env.databaseUrl);

export default drizzle(client);
