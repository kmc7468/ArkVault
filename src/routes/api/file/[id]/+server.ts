import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { fileInfoResponse, type FileInfoResponse } from "$lib/server/schemas";
import { getFileInformation } from "$lib/server/services/file";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, params }) => {
  const { userId } = await authorize(cookies, "activeClient");

  const zodRes = z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .safeParse(params);
  if (!zodRes.success) error(400, "Invalid path parameters");
  const { id } = zodRes.data;

  const { createdAt, mekVersion, encDek, dekVersion, contentType, encContentIv, encName } =
    await getFileInformation(userId, id);
  return json(
    fileInfoResponse.parse({
      createdAt: createdAt.toISOString(),
      mekVersion,
      dek: encDek,
      dekVersion: dekVersion.toISOString(),
      contentType: contentType,
      contentIv: encContentIv,
      name: encName.ciphertext,
      nameIv: encName.iv,
    } satisfies FileInfoResponse),
  );
};
