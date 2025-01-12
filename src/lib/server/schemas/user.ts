import { z } from "zod";

export const userInfoResponse = z.object({
  email: z.string().email().nonempty(),
  nickname: z.string().nonempty(),
});
export type UserInfoResponse = z.infer<typeof userInfoResponse>;

export const changeNicknameRequest = z.object({
  newNickname: z.string().min(2).max(8),
});
export type ChangeNicknameRequest = z.infer<typeof changeNicknameRequest>;
