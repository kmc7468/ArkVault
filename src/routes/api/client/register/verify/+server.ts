import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { clientRegisterVerifyRequest } from "$lib/server/schemas";
import { verifyUserClient } from "$lib/server/services/client";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId } = await authorize(locals, "notClient");

  const zodRes = clientRegisterVerifyRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { answer, answerSig } = zodRes.data;

  await verifyUserClient(userId, locals.ip, answer, answerSig);
  return text("Client verified", { headers: { "Content-Type": "text/plain" } });
};
