import { error, json } from "@sveltejs/kit";
import { authenticate } from "$lib/server/modules/auth";
import { getUserClientStatus } from "$lib/server/services/client";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const { userId, clientId } = authenticate(cookies);
  if (!clientId) {
    error(403, "Forbidden");
  }

  const { state, isInitialMekNeeded } = await getUserClientStatus(userId, clientId);
  return json({ id: clientId, state, isInitialMekNeeded });
};
