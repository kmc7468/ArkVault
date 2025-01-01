import { text } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { parseSignedRequest } from "$lib/server/modules/crypto";
import { createDirectory } from "$lib/server/services/file";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");
  const { parentId, mekVersion, dek, dekIv, name, nameIv } = await parseSignedRequest(
    clientId,
    await request.json(),
    z.object({
      parentId: z.union([z.enum(["root"]), z.number().int().positive()]),
      mekVersion: z.number().int().positive(),
      dek: z.string().base64().nonempty(),
      dekIv: z.string().base64().nonempty(),
      name: z.string().base64().nonempty(),
      nameIv: z.string().base64().nonempty(),
    }),
  );

  await createDirectory({
    userId,
    parentId,
    mekVersion,
    encDek: dek,
    encDekIv: dekIv,
    encName: name,
    encNameIv: nameIv,
  });
  return text("Directory created", { headers: { "Content-Type": "text/plain" } });
};
