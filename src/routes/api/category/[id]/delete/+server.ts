import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { deleteCategory } from "$lib/server/services/category";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, params }) => {
  const { userId } = await authorize(locals, "activeClient");

  const zodRes = z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .safeParse(params);
  if (!zodRes.success) error(400, "Invalid path parameters");
  const { id } = zodRes.data;

  await deleteCategory(userId, id);
  return text("Category deleted", { headers: { "Content-Type": "text/plain" } });
};
