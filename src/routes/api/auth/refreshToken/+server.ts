import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { refreshToken } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const zodRes = z
    .object({
      refreshToken: z.string().nonempty(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, zodRes.error.message);

  const { refreshToken: token } = zodRes.data;
  return json(await refreshToken(token.trim()));
};
