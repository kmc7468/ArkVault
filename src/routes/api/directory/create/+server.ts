import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { directoryCreateRequest } from "$lib/server/schemas";
import { createDirectory } from "$lib/server/services/directory";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId } = await authorize(locals, "activeClient");

  const zodRes = directoryCreateRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { parentId, mekVersion, dek, dekVersion, name, nameIv } = zodRes.data;

  await createDirectory({
    userId,
    parentId,
    mekVersion,
    encDek: dek,
    dekVersion: new Date(dekVersion),
    encName: name,
    encNameIv: nameIv,
  });
  return text("Directory created", { headers: { "Content-Type": "text/plain" } });
};
