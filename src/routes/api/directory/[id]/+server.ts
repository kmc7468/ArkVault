import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { directoryInfoResponse, type DirectoryInfoResponse } from "$lib/server/schemas";
import { getDirectoryInformation } from "$lib/server/services/directory";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, params }) => {
  const { userId } = await authorize(locals, "activeClient");

  const zodRes = z
    .object({
      id: z.union([z.enum(["root"]), z.coerce.number().int().positive()]),
    })
    .safeParse(params);
  if (!zodRes.success) error(400, "Invalid path parameters");
  const { id } = zodRes.data;

  const { metadata, directories, files } = await getDirectoryInformation(userId, id);
  return json(
    directoryInfoResponse.parse({
      metadata: metadata && {
        parent: metadata.parentId,
        mekVersion: metadata.mekVersion,
        dek: metadata.encDek,
        dekVersion: metadata.dekVersion.toISOString(),
        name: metadata.encName.ciphertext,
        nameIv: metadata.encName.iv,
      },
      subDirectories: directories,
      files,
    } satisfies DirectoryInfoResponse),
  );
};
