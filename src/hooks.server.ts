import { redirect, type ServerInit, type Handle } from "@sveltejs/kit";
import schedule from "node-schedule";
import { cleanupExpiredRefreshTokens } from "$lib/server/db/token";

export const init: ServerInit = () => {
  schedule.scheduleJob("0 * * * *", () => {
    cleanupExpiredRefreshTokens();
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
