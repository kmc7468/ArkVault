import { error, text } from "@sveltejs/kit";
import env from "$lib/server/loadenv";
import { loginRequest } from "$lib/server/schemas";
import { login } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
  const zodRes = loginRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { email, password } = zodRes.data;

  const { sessionIdSigned } = await login(email, password, locals.ip, locals.userAgent);
  cookies.set("sessionId", sessionIdSigned, {
    path: "/",
    maxAge: env.session.exp / 1000,
    secure: true,
    sameSite: "strict",
  });

  return text("Logged in", { headers: { "Content-Type": "text/plain" } });
};
