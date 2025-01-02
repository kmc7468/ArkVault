import { error, text } from "@sveltejs/kit";
import ms from "ms";
import env from "$lib/server/loadenv";
import { refreshToken as doRefreshToken } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Refresh token not found");

  const { accessToken, refreshToken } = await doRefreshToken(token);
  cookies.set("accessToken", accessToken, {
    path: "/",
    maxAge: ms(env.jwt.accessExp) / 1000,
    sameSite: "strict",
  });
  cookies.set("refreshToken", refreshToken, {
    path: "/api/auth",
    maxAge: ms(env.jwt.refreshExp) / 1000,
    sameSite: "strict",
  });

  return text("Token refreshed", { headers: { "Content-Type": "text/plain" } });
};
