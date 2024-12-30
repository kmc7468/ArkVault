import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { registerNewActiveMek } from "$lib/server/services/mek";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");

  const zodRes = z
    .object({
      meks: z.array(
        z.object({
          clientId: z.number().int().positive(),
          mek: z.string().base64().nonempty(),
          sigMek: z.string().base64().nonempty(),
        }),
      ),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { meks } = zodRes.data;

  await registerNewActiveMek(
    userId,
    clientId,
    meks.map(({ clientId, mek, sigMek }) => ({
      clientId,
      encMek: mek,
      sigEncMek: sigMek,
    })),
  );
  return text("MEK registered", { headers: { "Content-Type": "text/plain" } });
};
