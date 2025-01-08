import ms from "ms";
import { building } from "$app/environment";
import { env } from "$env/dynamic/private";

if (!building) {
  if (!env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
}

export default {
  databaseUrl: env.DATABASE_URL || "local.db",
  jwt: {
    secret: env.JWT_SECRET,
    accessExp: ms(env.JWT_ACCESS_TOKEN_EXPIRES || "5m"),
    refreshExp: ms(env.JWT_REFRESH_TOKEN_EXPIRES || "14d"),
  },
  challenge: {
    userClientExp: ms(env.USER_CLIENT_CHALLENGE_EXPIRES || "5m"),
    tokenUpgradeExp: ms(env.TOKEN_UPGRADE_CHALLENGE_EXPIRES || "5m"),
  },
  libraryPath: env.LIBRARY_PATH || "library",
};
