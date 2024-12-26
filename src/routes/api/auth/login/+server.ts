import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { login } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const zodRes = z
    .object({
      email: z.string().email().nonempty(),
      password: z.string().nonempty(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, zodRes.error.message);

  const { email, password } = zodRes.data;
  const loginRes = await login(email.trim(), password.trim());

  if (!loginRes) error(401, "Invalid email or password");
  const { accessToken, refreshToken } = loginRes;

  return json({ accessToken, refreshToken });
};
