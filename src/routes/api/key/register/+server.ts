import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { authenticate } from "$lib/server/modules/auth";
import { registerPubKey } from "$lib/server/services/key";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const zodRes = z
    .object({
      pubKey: z.string().base64().nonempty(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");

  const { userId, clientId } = authenticate(cookies);
  if (clientId) {
    error(403, "Forbidden");
  }

  const { pubKey } = zodRes.data;
  const challenge = await registerPubKey(userId, getClientAddress(), pubKey.trim());
  return json({ challenge });
};
