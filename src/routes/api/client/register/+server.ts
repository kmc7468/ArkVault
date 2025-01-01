import { error, json } from "@sveltejs/kit";
import { authenticate } from "$lib/server/modules/auth";
import {
  clientRegisterRequest,
  clientRegisterResponse,
  type ClientRegisterResponse,
} from "$lib/server/schemas/client";
import { registerUserClient } from "$lib/server/services/client";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const { userId, clientId } = authenticate(cookies);
  if (clientId) {
    error(403, "Forbidden");
  }

  const zodRes = clientRegisterRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { encPubKey, sigPubKey } = zodRes.data;

  const { challenge } = await registerUserClient(userId, getClientAddress(), encPubKey, sigPubKey);
  return json(clientRegisterResponse.parse({ challenge } satisfies ClientRegisterResponse));
};
