import { accessToken } from "$lib/stores/auth";

const refreshToken = async () => {
  const res = await fetch("/api/auth/refreshtoken", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) {
    accessToken.set(null);
    throw new Error("Failed to refresh token");
  }

  const data = await res.json();
  const token = data.accessToken as string;

  accessToken.set(token);
  return token;
};

const callAPIInternal = async (
  input: RequestInfo,
  init?: RequestInit,
  token?: string | null,
  retryIfUnauthorized = true,
): Promise<Response> => {
  if (token === null) {
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

export const callAPI = async (input: RequestInfo, init?: RequestInit, token?: string | null) => {
  return await callAPIInternal(input, init, token);
};
