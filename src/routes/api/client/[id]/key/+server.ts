import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { authorize } from "$lib/server/modules/auth";
import { getUserClientEncPubKey } from "$lib/server/services/client";
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

  const { encPubKey } = await getUserClientEncPubKey(userId, id);
  return json({ encPubKey });
};
