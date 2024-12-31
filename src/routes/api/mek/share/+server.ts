import { text } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { parseSignedRequest } from "$lib/server/modules/crypto";
import { shareMeksForNewClient } from "$lib/server/services/mek";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");
  const { targetId, meks } = await parseSignedRequest(
    clientId,
    await request.json(),
    z.object({
      targetId: z.number().int().positive(),
      meks: z.array(
        z.object({
          version: z.number().int().positive(),
          mek: z.string().base64().nonempty(),
        }),
      ),
    }),
  );

  await shareMeksForNewClient(
    userId,
    targetId,
    meks.map(({ version, mek }) => ({ version, encMek: mek })),
  );
  return text("MEK shared", { headers: { "Content-Type": "text/plain" } });
};
