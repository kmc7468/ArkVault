import { error, text } from "@sveltejs/kit";
import { authenticate } from "$lib/server/modules/auth";
import { parseSignedRequest } from "$lib/server/modules/crypto";
import { initialMasterKeyRegisterRequest } from "$lib/server/schemas/mek";
import { registerInitialActiveMek } from "$lib/server/services/mek";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = authenticate(cookies);
  if (!clientId) {
    error(403, "Forbidden");
  }

  const { mek, mekSig } = await parseSignedRequest(
    clientId,
    await request.json(),
    initialMasterKeyRegisterRequest,
  );

  await registerInitialActiveMek(userId, clientId, mek, mekSig);
  return text("MEK registered", { headers: { "Content-Type": "text/plain" } });
};
