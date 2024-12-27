import { error } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import env from "$lib/server/loadenv";

interface TokenData {
  type: "access" | "refresh";
  userId: number;
  clientId?: number;
}

export enum TokenError {
  EXPIRED,
  INVALID,
}

export const issueToken = (type: "access" | "refresh", userId: number, clientId?: number) => {
  return jwt.sign(
    {
      type,
      userId,
      clientId,
    } satisfies TokenData,
    env.jwt.secret,
    {
      expiresIn: type === "access" ? env.jwt.accessExp : env.jwt.refreshExp,
    },
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, env.jwt.secret) as TokenData;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return TokenError.EXPIRED;
    }
    return TokenError.INVALID;
  }
};

export const authenticate = (request: Request) => {
  const accessToken = request.headers.get("Authorization");
  if (!accessToken?.startsWith("Bearer ")) {
    error(401, "Token required");
  }

  const tokenData = verifyToken(accessToken.slice(7));
  if (tokenData === TokenError.EXPIRED) {
    error(401, "Token expired");
  } else if (tokenData === TokenError.INVALID || tokenData.type !== "access") {
    error(401, "Invalid token");
  }

  return {
    userId: tokenData.userId,
    clientId: tokenData.clientId,
  };
};
