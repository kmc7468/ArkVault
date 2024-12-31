import { text } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { parseSignedRequest } from "$lib/server/modules/crypto";
import { registerNewActiveMek } from "$lib/server/services/mek";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");
  const { meks } = await parseSignedRequest(
    clientId,
    await request.json(),
    z.object({
      meks: z.array(
        z.object({
          clientId: z.number().int().positive(),
          mek: z.string().base64().nonempty(),
        }),
      ),
    }),
  );

  await registerNewActiveMek(
    userId,
    clientId,
    meks.map(({ clientId, mek }) => ({
      clientId,
      encMek: mek,
    })),
  );
  return text("MEK registered", { headers: { "Content-Type": "text/plain" } });
};
