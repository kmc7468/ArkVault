import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { fileUploadRequest } from "$lib/server/schemas";
import { uploadFile } from "$lib/server/services/file";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId } = await authorize(locals, "activeClient");

  const form = await request.formData();
  const metadata = form.get("metadata");
  const content = form.get("content");
  if (typeof metadata !== "string" || !(content instanceof File)) {
    error(400, "Invalid request body");
  }

  const zodRes = fileUploadRequest.safeParse(JSON.parse(metadata));
  if (!zodRes.success) error(400, "Invalid request body");
  const {
    parentId,
    mekVersion,
    dek,
    dekVersion,
    hskVersion,
    contentHmac,
    contentType,
    contentIv,
    name,
    nameIv,
    createdAt,
    createdAtIv,
    lastModifiedAt,
    lastModifiedAtIv,
  } = zodRes.data;
  if ((createdAt && !createdAtIv) || (!createdAt && createdAtIv))
    error(400, "Invalid request body");

  await uploadFile(
    {
      userId,
      parentId,
      mekVersion,
      encDek: dek,
      dekVersion: new Date(dekVersion),
      hskVersion,
      contentHmac,
      contentType,
      encContentIv: contentIv,
      encName: name,
      encNameIv: nameIv,
      encCreatedAt: createdAt ?? null,
      encCreatedAtIv: createdAtIv ?? null,
      encLastModifiedAt: lastModifiedAt,
      encLastModifiedAtIv: lastModifiedAtIv,
    },
    content.stream(),
  );
  return text("File uploaded", { headers: { "Content-Type": "text/plain" } });
};
