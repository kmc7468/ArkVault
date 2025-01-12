import { error, text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { changeNicknameRequest } from "$lib/server/schemas";
import { changeNickname } from "$lib/server/services/user";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId } = await authorize(locals, "any");

  const zodRes = changeNicknameRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { newNickname } = zodRes.data;

  await changeNickname(userId, newNickname);
  return text("Nickname changed", { headers: { "Content-Type": "text/plain" } });
};
