import { text } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { logout } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, cookies }) => {
  const { sessionId } = await authorize(locals, "any");

  await logout(sessionId);
  cookies.delete("sessionId", { path: "/" });

  return text("Logged out", { headers: { "Content-Type": "text/plain" } });
};
