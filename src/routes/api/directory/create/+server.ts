import { text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { parseSignedRequest } from "$lib/server/modules/crypto";
import { directoryCreateRequest } from "$lib/server/schemas/directory";
import { createDirectory } from "$lib/server/services/file";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");
  const { parentId, mekVersion, dek, name, nameIv } = await parseSignedRequest(
    clientId,
    await request.json(),
    directoryCreateRequest,
  );

  await createDirectory({
    userId,
    parentId,
    mekVersion,
    encDek: dek,
    encName: name,
    encNameIv: nameIv,
  });
  return text("Directory created", { headers: { "Content-Type": "text/plain" } });
};
