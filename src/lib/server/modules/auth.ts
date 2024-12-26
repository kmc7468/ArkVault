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
