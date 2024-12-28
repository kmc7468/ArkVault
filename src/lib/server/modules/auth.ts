import { error, type Cookies } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
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

export const issueToken = (payload: TokenPayload) => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: payload.type === "access" ? env.jwt.accessExp : env.jwt.refreshExp,
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
