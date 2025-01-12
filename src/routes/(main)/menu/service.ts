import { callPostApi } from "$lib/hooks";

export const requestLogout = async () => {
  const res = await callPostApi("/api/auth/logout");
  return res.ok;
};
