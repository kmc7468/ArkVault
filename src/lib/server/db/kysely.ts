import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./schema";

const dialect = new PostgresDialect({
  pool: new Pool({
    // TODO
  }),
});

const db = new Kysely<Database>({ dialect });

// TODO: Migration

export default db;
