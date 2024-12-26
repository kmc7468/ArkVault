import { error, json } from "@sveltejs/kit";
import { refreshToken } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Token not found");

  const { accessToken, refreshToken: newToken } = await refreshToken(token.trim());

  cookies.set("refreshToken", newToken, {
    path: "/api/auth",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  return json({ accessToken });
};
