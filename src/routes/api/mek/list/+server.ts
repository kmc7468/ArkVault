import { error, json } from "@sveltejs/kit";
import { authenticate } from "$lib/server/modules/auth";
import { getClientMekList } from "$lib/server/services/mek";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const { userId, clientId } = authenticate(cookies);
  if (!clientId) {
    error(403, "Forbidden");
  }

  const { meks } = await getClientMekList(userId, clientId);
  return json({ meks });
};
