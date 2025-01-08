import { error, json } from "@sveltejs/kit";
import { authenticate } from "$lib/server/modules/auth";
import { clientListResponse, type ClientListResponse } from "$lib/server/schemas";
import { getUserClientList } from "$lib/server/services/client";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies }) => {
  const { userId, clientId } = authenticate(cookies);
  if (!clientId) {
    error(403, "Forbidden");
  }

  const { userClients } = await getUserClientList(userId);
  return json(clientListResponse.parse({ clients: userClients } satisfies ClientListResponse));
};
