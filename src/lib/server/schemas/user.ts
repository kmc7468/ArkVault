import { z } from "zod";

export const userInfoResponse = z.object({
  email: z.string().email(),
  nickname: z.string().nonempty(),
});
export type UserInfoResponse = z.infer<typeof userInfoResponse>;

export const nicknameChangeRequest = z.object({
  newNickname: z.string().trim().min(2).max(8),
});
export type NicknameChangeRequest = z.infer<typeof nicknameChangeRequest>;
