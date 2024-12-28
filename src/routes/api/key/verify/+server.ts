import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authenticate } from "$lib/server/modules/auth";
import { verifyPubKey } from "$lib/server/services/key";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const zodRes = z
    .object({
      answer: z.string().base64().nonempty(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");

  const { userId, clientId } = authenticate(cookies);
  if (clientId) {
    error(403, "Forbidden");
  }

  await verifyPubKey(userId, getClientAddress(), zodRes.data.answer);
  return text("Key verified", { headers: { "Content-Type": "text/plain" } });
};
