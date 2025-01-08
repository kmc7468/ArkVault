import { error, type Cookies } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { getUserClient } from "$lib/server/db/client";
import env from "$lib/server/loadenv";

type TokenPayload =
  | {
      type: "access";
      userId: number;
      clientId?: number;
    }
  | {
      type: "refresh";
      jti: string;
    };

export enum TokenError {
  EXPIRED,
  INVALID,
}

type Permission = "pendingClient" | "activeClient";

export const issueToken = (payload: TokenPayload) => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: (payload.type === "access" ? env.jwt.accessExp : env.jwt.refreshExp) / 1000,
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, env.jwt.secret) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return TokenError.EXPIRED;
    }
    return TokenError.INVALID;
  }
};

export const authenticate = (cookies: Cookies) => {
  const accessToken = cookies.get("accessToken");
  if (!accessToken) {
    error(401, "Access token not found");
  }

  const tokenPayload = verifyToken(accessToken);
  if (tokenPayload === TokenError.EXPIRED) {
    error(401, "Access token expired");
  } else if (tokenPayload === TokenError.INVALID || tokenPayload.type !== "access") {
    error(401, "Invalid access token");
  }

  return {
    userId: tokenPayload.userId,
    clientId: tokenPayload.clientId,
  };
};

export async function authorize(
  cookies: Cookies,
  requiredPermission: "pendingClient",
): Promise<{ userId: number; clientId: number }>;

export async function authorize(
  cookies: Cookies,
  requiredPermission: "activeClient",
): Promise<{ userId: number; clientId: number }>;

export async function authorize(
  cookies: Cookies,
  requiredPermission: Permission,
): Promise<{ userId: number; clientId?: number }> {
  const tokenPayload = authenticate(cookies);
  const { userId, clientId } = tokenPayload;
  const userClient = clientId ? await getUserClient(userId, clientId) : undefined;

  switch (requiredPermission) {
    case "pendingClient":
      if (!userClient || userClient.state !== "pending") {
        error(403, "Forbidden");
      }
      return tokenPayload;
    case "activeClient":
      if (!userClient || userClient.state !== "active") {
        error(403, "Forbidden");
      }
      return tokenPayload;
  }
}
