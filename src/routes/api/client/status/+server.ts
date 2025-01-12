import { json } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { clientStatusResponse, type ClientStatusResponse } from "$lib/server/schemas";
import { getUserClientStatus } from "$lib/server/services/client";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  const { userId, clientId } = await authorize(locals, "anyClient");
  const { state, isInitialMekNeeded } = await getUserClientStatus(userId, clientId);
  return json(
    clientStatusResponse.parse({
      id: clientId,
      state,
      isInitialMekNeeded,
    } satisfies ClientStatusResponse),
  );
};
