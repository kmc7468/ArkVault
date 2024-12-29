import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authenticate } from "$lib/server/modules/auth";
import { verifyUserClient } from "$lib/server/services/client";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const { userId, clientId } = authenticate(cookies);
  if (clientId) {
    error(403, "Forbidden");
  }

  const zodRes = z
    .object({
      answer: z.string().base64().nonempty(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { answer } = zodRes.data;

  await verifyUserClient(userId, getClientAddress(), answer.trim());
  return text("Client verified", { headers: { "Content-Type": "text/plain" } });
};
