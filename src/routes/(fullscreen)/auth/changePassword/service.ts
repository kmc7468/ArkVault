import { callPostApi } from "$lib/hooks";
import type { PasswordChangeRequest } from "$lib/server/schemas";

export const requestPasswordChange = async (oldPassword: string, newPassword: string) => {
  const res = await callPostApi<PasswordChangeRequest>("/api/auth/changePassword", {
    oldPassword,
    newPassword,
  });
  return res.ok;
};
