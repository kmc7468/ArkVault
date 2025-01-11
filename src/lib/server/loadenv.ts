import ms from "ms";
import { building } from "$app/environment";
import { env } from "$env/dynamic/private";

if (!building) {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET not set");
}

export default {
  databaseUrl: env.DATABASE_URL || "local.db",
  session: {
    secret: env.SESSION_SECRET!,
    exp: ms(env.SESSION_EXPIRES || "14d"),
  },
  challenge: {
    userClientExp: ms(env.USER_CLIENT_CHALLENGE_EXPIRES || "5m"),
    sessionUpgradeExp: ms(env.SESSION_UPGRADE_CHALLENGE_EXPIRES || "5m"),
  },
  libraryPath: env.LIBRARY_PATH || "library",
};
