import { signRequestBody } from "$lib/modules/crypto";

export const refreshToken = async () => {
  return await fetch("/api/auth/refreshToken", { method: "POST" });
};

const callApi = async (input: RequestInfo, init?: RequestInit) => {
  let res = await fetch(input, init);
  if (res.status === 401) {
    res = await refreshToken();
    if (!res.ok) {
      return res;
    }
    res = await fetch(input, init);
  }
  return res;
};

export const callGetApi = async (input: RequestInfo) => {
  return await callApi(input);
};

export const callPostApi = async <T>(input: RequestInfo, payload: T) => {
  return await callApi(input, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const callSignedPostApi = async <T>(input: RequestInfo, payload: T, signKey: CryptoKey) => {
  return await callApi(input, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: await signRequestBody(payload, signKey),
  });
};
