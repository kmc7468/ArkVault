import { error, text } from "@sveltejs/kit";
import { refreshToken as doRefreshToken } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Refresh token not found");

  const { accessToken, refreshToken } = await doRefreshToken(token);
  cookies.set("accessToken", accessToken, {
    path: "/",
    sameSite: "strict",
  });
  cookies.set("refreshToken", refreshToken, {
    path: "/api/auth",
    sameSite: "strict",
  });

  return text("Token refreshed", { headers: { "Content-Type": "text/plain" } });
};
