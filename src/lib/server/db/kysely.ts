import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import env from "$lib/server/loadenv";
import type { Database } from "./schema";

const dialect = new PostgresDialect({
  pool: new Pool({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
  }),
});

const db = new Kysely<Database>({ dialect });

// TODO: Migration

export default db;
