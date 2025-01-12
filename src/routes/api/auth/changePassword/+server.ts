import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { changePasswordRequest } from "$lib/server/schemas";
import { changePassword } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { sessionId, userId } = await authorize(locals, "any");

  const zodRes = changePasswordRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { oldPassword, newPassword } = zodRes.data;

  await changePassword(userId, sessionId, oldPassword, newPassword);
  return text("Password changed", { headers: { "Content-Type": "text/plain" } });
};
