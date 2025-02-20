import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { directoryRenameRequest } from "$lib/server/schemas";
import { renameDirectory } from "$lib/server/services/directory";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, params, request }) => {
  const { userId } = await authorize(locals, "activeClient");

  const paramsZodRes = z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .safeParse(params);
  if (!paramsZodRes.success) error(400, "Invalid path parameters");
  const { id } = paramsZodRes.data;

  const bodyZodRes = directoryRenameRequest.safeParse(await request.json());
  if (!bodyZodRes.success) error(400, "Invalid request body");
  const { dekVersion, name, nameIv } = bodyZodRes.data;

  await renameDirectory(userId, id, new Date(dekVersion), { ciphertext: name, iv: nameIv });
  return text("Directory renamed", { headers: { "Content-Type": "text/plain" } });
};
