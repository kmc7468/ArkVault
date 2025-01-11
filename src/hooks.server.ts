import type { ServerInit } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import schedule from "node-schedule";
import { cleanupExpiredUserClientChallenges } from "$lib/server/db/client";
import { migrateDB } from "$lib/server/db/drizzle";
import {
  cleanupExpiredSessions,
  cleanupExpiredSessionUpgradeChallenges,
} from "$lib/server/db/session";
import { authenticate, setAgentInfo } from "$lib/server/middlewares";

export const init: ServerInit = () => {
  migrateDB();

  schedule.scheduleJob("0 * * * *", () => {
    cleanupExpiredUserClientChallenges();
    cleanupExpiredSessions();
    cleanupExpiredSessionUpgradeChallenges();
  });
};

export const handle = sequence(setAgentInfo, authenticate);
