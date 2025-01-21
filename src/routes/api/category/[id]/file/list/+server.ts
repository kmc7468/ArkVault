import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { categoryFileListResponse, type CategoryFileListResponse } from "$lib/server/schemas";
import { getCategoryFiles } from "$lib/server/services/category";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, params }) => {
  const { userId } = await authorize(locals, "activeClient");

  const zodRes = z.object({ id: z.coerce.number().int().positive() }).safeParse(params);
  if (!zodRes.success) error(400, "Invalid path parameters");
  const { id } = zodRes.data;

  const { files } = await getCategoryFiles(userId, id);
  return json(categoryFileListResponse.parse({ files }) as CategoryFileListResponse);
};
