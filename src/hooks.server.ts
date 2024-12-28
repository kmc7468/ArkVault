import type { ServerInit } from "@sveltejs/kit";
import schedule from "node-schedule";
import { cleanupExpiredRefreshTokens } from "$lib/server/db/token";

export const init: ServerInit = () => {
  schedule.scheduleJob("0 * * * *", () => {
    cleanupExpiredRefreshTokens();
  });
};
