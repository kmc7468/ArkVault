import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { parseSignedRequest } from "$lib/server/modules/crypto";
import { fileUploadRequest } from "$lib/server/schemas";
import { uploadFile } from "$lib/server/services/file";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");

  const form = await request.formData();

  const metadata = form.get("metadata");
  if (!metadata || typeof metadata !== "string") {
    error(400, "Invalid request body");
  }
  const { parentId, mekVersion, dek, contentHash, contentIv, name, nameIv } =
    await parseSignedRequest(clientId, JSON.parse(metadata), fileUploadRequest);

  const content = form.get("content");
  if (!content || !(content instanceof File)) {
    error(400, "Invalid request body");
  }

  await uploadFile(
    {
      userId,
      parentId,
      mekVersion,
      encDek: dek,
      encContentIv: contentIv,
      encName: name,
      encNameIv: nameIv,
    },
    content.stream(),
    contentHash,
  );
  return text("File uploaded", { headers: { "Content-Type": "text/plain" } });
};
