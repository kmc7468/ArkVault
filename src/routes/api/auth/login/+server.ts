import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { login } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const zodRes = z
    .object({
      email: z.string().email().nonempty(),
      password: z.string().nonempty(),
      pubKey: z.string().nonempty().optional(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, zodRes.error.message);

  const { email, password, pubKey } = zodRes.data;
  const loginRes = await login(email.trim(), password.trim(), pubKey?.trim());
  if (!loginRes) error(401, "Invalid email, password, or public key");

  const { accessToken, refreshToken } = loginRes;
  return json({ accessToken, refreshToken });
};
