import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { initialHmacSecretRegisterRequest } from "$lib/server/schemas";
import { registerInitialActiveHsk } from "$lib/server/services/hsk";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId, clientId } = await authorize(locals, "activeClient");

  const zodRes = initialHmacSecretRegisterRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { mekVersion, hsk } = zodRes.data;

  await registerInitialActiveHsk(userId, clientId, mekVersion, hsk);
  return text("HSK registered", { headers: { "Content-Type": "text/plain" } });
};
