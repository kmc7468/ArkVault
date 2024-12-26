import { error, text } from "@sveltejs/kit";
import { logout } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Token not found");

  await logout(token.trim());
  return text("Logged out");
};
