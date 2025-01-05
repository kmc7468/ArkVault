import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { parseSignedRequest } from "$lib/server/modules/crypto";
import { fileRenameRequest } from "$lib/server/schemas";
import { renameFile } from "$lib/server/services/file";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, params }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");

  const zodRes = z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .safeParse(params);
  if (!zodRes.success) error(400, "Invalid path parameters");
  const { id } = zodRes.data;
  const { name, nameIv } = await parseSignedRequest(
    clientId,
    await request.json(),
    fileRenameRequest,
  );

  await renameFile(userId, id, name, nameIv);
  return text("File renamed", { headers: { "Content-Type": "text/plain" } });
};
