import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/server/db/schema",

  dbCredentials: {
    url: process.env.DATABASE_URL || "local.db",
  },

  verbose: true,
  strict: true,
  dialect: "sqlite",
});
