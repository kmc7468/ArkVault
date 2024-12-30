import { error, text } from "@sveltejs/kit";
import { logout } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Refresh token not found");

  await logout(token.trim());
  cookies.delete("accessToken", { path: "/" });
  cookies.delete("refreshToken", { path: "/api/auth" });

  return text("Logged out", { headers: { "Content-Type": "text/plain" } });
};
