import { error, json } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { getClientMekList } from "$lib/server/services/mek";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");
  const { meks } = await getClientMekList(userId, clientId);
  return json({ meks });
};
