import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { categoryFileListResponse, type CategoryFileListResponse } from "$lib/server/schemas";
import { getCategoryFiles } from "$lib/server/services/category";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url, params }) => {
  const { userId } = await authorize(locals, "activeClient");

  const paramsZodRes = z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .safeParse(params);
  if (!paramsZodRes.success) error(400, "Invalid path parameters");
  const { id } = paramsZodRes.data;

  const queryZodRes = z
    .object({
      recurse: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .nullable(),
    })
    .safeParse({ recurse: url.searchParams.get("recurse") });
  if (!queryZodRes.success) error(400, "Invalid query parameters");
  const { recurse } = queryZodRes.data;

  const { files } = await getCategoryFiles(userId, id, recurse ?? false);
  return json(
    categoryFileListResponse.parse({
      files: files.map(({ id, isRecursive }) => ({ file: id, isRecursive })),
    } satisfies CategoryFileListResponse),
  );
};
