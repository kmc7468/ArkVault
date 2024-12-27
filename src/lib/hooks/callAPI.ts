import { get } from "svelte/store";
import { accessTokenStore } from "$lib/stores";

const refreshToken = async () => {
  const res = await fetch("/api/auth/refreshToken", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) {
    accessTokenStore.set(null);
    throw new Error("Failed to refresh token");
  }

  const data = await res.json();
  const token = data.accessToken as string;

  accessTokenStore.set(token);
  return token;
};

const callAPIInternal = async (
  input: RequestInfo,
  init: RequestInit | undefined,
  token: string | null,
  retryIfUnauthorized = true,
): Promise<Response> => {
  if (!token) {
    token = await refreshToken();
    retryIfUnauthorized = false;
  }

  const res = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401 && retryIfUnauthorized) {
    return await callAPIInternal(input, init, null, false);
  }

  return res;
};

export const callAPI = async (input: RequestInfo, init?: RequestInit) => {
  return await callAPIInternal(input, init, get(accessTokenStore));
};
