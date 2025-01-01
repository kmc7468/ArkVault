import { z } from "zod";

export const loginRequest = z.object({
  email: z.string().email().nonempty(),
  password: z.string().trim().nonempty(),
});
export type LoginRequest = z.infer<typeof loginRequest>;

export const tokenUpgradeRequest = z.object({
  encPubKey: z.string().base64().nonempty(),
  sigPubKey: z.string().base64().nonempty(),
});
export type TokenUpgradeRequest = z.infer<typeof tokenUpgradeRequest>;

export const tokenUpgradeResponse = z.object({
  challenge: z.string().base64().nonempty(),
});
export type TokenUpgradeResponse = z.infer<typeof tokenUpgradeResponse>;

export const tokenUpgradeVerifyRequest = z.object({
  answer: z.string().base64().nonempty(),
  sigAnswer: z.string().base64().nonempty(),
});
export type TokenUpgradeVerifyRequest = z.infer<typeof tokenUpgradeVerifyRequest>;
