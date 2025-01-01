import { error, text } from "@sveltejs/kit";
import ms from "ms";
import env from "$lib/server/loadenv";
import { loginRequest } from "$lib/server/schemas/auth";
import { login } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const zodRes = loginRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { email, password } = zodRes.data;

  const { accessToken, refreshToken } = await login(email, password);
  cookies.set("accessToken", accessToken, {
    path: "/",
    maxAge: Math.floor(ms(env.jwt.accessExp) / 1000),
    sameSite: "strict",
  });
  cookies.set("refreshToken", refreshToken, {
    path: "/api/auth",
    maxAge: Math.floor(ms(env.jwt.refreshExp) / 1000),
    sameSite: "strict",
  });

  return text("Logged in", { headers: { "Content-Type": "text/plain" } });
};
