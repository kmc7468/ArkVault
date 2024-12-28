import { error, text } from "@sveltejs/kit";
import { z } from "zod";
import { upgradeTokens } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Refresh token not found");

  const zodRes = z
    .object({
      pubKey: z.string().base64().nonempty(),
    })
    .safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");

  const { pubKey } = zodRes.data;
  const { accessToken, refreshToken } = await upgradeTokens(token.trim(), pubKey.trim());

  cookies.set("accessToken", accessToken, {
    path: "/",
    sameSite: "strict",
  });
  cookies.set("refreshToken", refreshToken, {
    path: "/api/auth",
    sameSite: "strict",
  });
  return text("Token upgraded", { headers: { "Content-Type": "text/plain" } });
};
