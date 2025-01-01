import { error, text } from "@sveltejs/kit";
import { tokenUpgradeVerifyRequest } from "$lib/server/schemas/auth";
import { upgradeToken } from "$lib/server/services/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const token = cookies.get("refreshToken");
  if (!token) error(401, "Refresh token not found");

  const zodRes = tokenUpgradeVerifyRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { answer, sigAnswer } = zodRes.data;

  const { accessToken, refreshToken } = await upgradeToken(
    token,
    getClientAddress(),
    answer,
    sigAnswer,
  );
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
