import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { categoryCreateRequest } from "$lib/server/schemas";
import { createCategory } from "$lib/server/services/category";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId } = await authorize(locals, "activeClient");

  const zodRes = categoryCreateRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { parent, mekVersion, dek, dekVersion, name, nameIv } = zodRes.data;

  await createCategory({
    userId,
    parentId: parent,
    mekVersion,
    encDek: dek,
    dekVersion: new Date(dekVersion),
    encName: { ciphertext: name, iv: nameIv },
  });
  return text("Category created", { headers: { "Content-Type": "text/plain" } });
};
