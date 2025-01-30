import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { categoryFileRemoveRequest } from "$lib/server/schemas";
import { removeCategoryFile } from "$lib/server/services/category";
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

  const bodyZodRes = categoryFileRemoveRequest.safeParse(await request.json());
  if (!bodyZodRes.success) error(400, "Invalid request body");
  const { file } = bodyZodRes.data;

  await removeCategoryFile(userId, id, file);
  return text("File removed", { headers: { "Content-Type": "text/plain" } });
};
