import { error, text } from "@sveltejs/kit";
import { authenticate } from "$lib/server/modules/auth";
import { clientRegisterVerifyRequest } from "$lib/server/schemas/client";
import { verifyUserClient } from "$lib/server/services/client";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const { userId, clientId } = authenticate(cookies);
  if (clientId) {
    error(403, "Forbidden");
  }

  const zodRes = clientRegisterVerifyRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { answer, sigAnswer } = zodRes.data;

  await verifyUserClient(userId, getClientAddress(), answer, sigAnswer);
  return text("Client verified", { headers: { "Content-Type": "text/plain" } });
};
