import { callAPI } from "$lib/hooks";
import { accessTokenStore } from "$lib/stores";

export const requestLogin = async (email: string, password: string) => {
  const res = await callAPI("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    return false;
  }

  const data = await res.json();
  const token = data.accessToken as string;

  accessTokenStore.set(token);
  return true;
};
