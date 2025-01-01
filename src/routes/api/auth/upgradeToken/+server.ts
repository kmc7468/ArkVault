import { error, json } from "@sveltejs/kit";
import {
  tokenUpgradeRequest,
  tokenUpgradeResponse,
  type TokenUpgradeResponse,
} from "$lib/server/schemas/auth";
import { createTokenUpgradeChallenge } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Refresh token not found");

  const zodRes = tokenUpgradeRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { encPubKey, sigPubKey } = zodRes.data;

  const { challenge } = await createTokenUpgradeChallenge(
    token,
    getClientAddress(),
    encPubKey,
    sigPubKey,
  );
  return json(tokenUpgradeResponse.parse({ challenge } satisfies TokenUpgradeResponse));
};
