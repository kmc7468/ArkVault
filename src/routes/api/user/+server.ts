import { json } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { userInfoResponse, type UserInfoResponse } from "$lib/server/schemas";
import { getUserInformation } from "$lib/server/services/user";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  const { userId } = await authorize(locals, "any");
  const { email, nickname } = await getUserInformation(userId);
  return json(userInfoResponse.parse({ email, nickname } satisfies UserInfoResponse));
};
