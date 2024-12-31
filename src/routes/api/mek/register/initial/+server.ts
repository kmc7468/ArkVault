import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authenticate } from "$lib/server/modules/auth";
import { parseSignedRequest } from "$lib/server/modules/crypto";
import { registerInitialActiveMek } from "$lib/server/services/mek";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = authenticate(cookies);
  if (!clientId) {
    error(403, "Forbidden");
  }

  const { mek } = await parseSignedRequest(
    clientId,
    await request.json(),
    z.object({
      mek: z.string().base64().nonempty(),
    }),
  );

  await registerInitialActiveMek(userId, clientId, mek);
  return text("MEK registered", { headers: { "Content-Type": "text/plain" } });
};
