import { redirect, type ServerInit, type Handle } from "@sveltejs/kit";
import schedule from "node-schedule";
import { cleanupExpiredUserClientChallenges } from "$lib/server/db/client";
import { migrateDB } from "$lib/server/db/drizzle";
import {
  cleanupExpiredRefreshTokens,
  cleanupExpiredTokenUpgradeChallenges,
} from "$lib/server/db/token";

export const init: ServerInit = () => {
  migrateDB();

  schedule.scheduleJob("0 * * * *", () => {
    cleanupExpiredUserClientChallenges();
    cleanupExpiredRefreshTokens();
    cleanupExpiredTokenUpgradeChallenges();
  });
};

export const handle: Handle = async ({ event, resolve }) => {
  if (["/api", "/auth"].some((path) => event.url.pathname.startsWith(path))) {
    return await resolve(event);
  }

  const accessToken = event.cookies.get("accessToken");
  if (accessToken) {
    return await resolve(event);
  } else {
    redirect(
      302,
      "/auth/login?redirect=" + encodeURIComponent(event.url.pathname + event.url.search),
    );
  }
};
