import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authenticate } from "$lib/server/modules/auth";
import { registerInitialActiveMek } from "$lib/server/services/mek";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = authenticate(cookies);
  if (!clientId) {
    error(403, "Forbidden");
  }

  const zodRes = z
    .object({
      mek: z.string().base64().nonempty(),
      sigMek: z.string().base64().nonempty(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { mek, sigMek } = zodRes.data;

  await registerInitialActiveMek(userId, clientId, mek, sigMek);
  return text("MEK registered", { headers: { "Content-Type": "text/plain" } });
};
