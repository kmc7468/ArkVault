import { error, json } from "@sveltejs/kit";
import ms from "ms";
import { z } from "zod";
import env from "$lib/server/loadenv";
import { login } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const zodRes = z
    .object({
      email: z.string().email().nonempty(),
      password: z.string().nonempty(),
      pubKey: z.string().nonempty().optional(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");

  const { email, password, pubKey } = zodRes.data;
  const { accessToken, refreshToken } = await login(email.trim(), password.trim(), pubKey?.trim());

  cookies.set("refreshToken", refreshToken, {
    path: "/api/auth",
    maxAge: Math.floor(ms(env.jwt.refreshExp) / 1000),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  return json({ accessToken });
};
