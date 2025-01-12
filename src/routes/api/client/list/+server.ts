import { json } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { clientListResponse, type ClientListResponse } from "$lib/server/schemas";
import { getUserClientList } from "$lib/server/services/client";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  const { userId } = await authorize(locals, "anyClient");
  const { userClients } = await getUserClientList(userId);
  return json(clientListResponse.parse({ clients: userClients } satisfies ClientListResponse));
};
