import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { initialMasterKeyRegisterRequest } from "$lib/server/schemas";
import { registerInitialActiveMek } from "$lib/server/services/mek";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId, clientId } = await authorize(locals, "pendingClient");

  const zodRes = initialMasterKeyRegisterRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { mek, mekSig } = zodRes.data;

  await registerInitialActiveMek(userId, clientId, mek, mekSig);
  return text("MEK registered", { headers: { "Content-Type": "text/plain" } });
};
