import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { createTokenUpgradeChallenge } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Refresh token not found");

  const zodRes = z
    .object({
      encPubKey: z.string().base64().nonempty(),
      sigPubKey: z.string().base64().nonempty(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { encPubKey, sigPubKey } = zodRes.data;

  const { challenge } = await createTokenUpgradeChallenge(
    token.trim(),
    getClientAddress(),
    encPubKey.trim(),
    sigPubKey.trim(),
  );
  return json({ challenge });
};
