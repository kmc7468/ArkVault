import { json } from "@sveltejs/kit";
import { authenticate } from "$lib/server/modules/auth";
import { clientListResponse, type ClientListResponse } from "$lib/server/schemas";
import { getUserClientList } from "$lib/server/services/client";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const { userId } = authenticate(cookies);
  const { userClients } = await getUserClientList(userId);
  return json(clientListResponse.parse({ clients: userClients } satisfies ClientListResponse));
};
