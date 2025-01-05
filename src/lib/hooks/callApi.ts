export const refreshToken = async (fetchInternal = fetch) => {
  return await fetchInternal("/api/auth/refreshToken", { method: "POST" });
};

const callApi = async (input: RequestInfo, init?: RequestInit, fetchInternal = fetch) => {
  let res = await fetchInternal(input, init);
  if (res.status === 401) {
    res = await refreshToken();
    if (!res.ok) {
      return res;
    }
    res = await fetchInternal(input, init);
  }
  return res;
};

export const callGetApi = async (input: RequestInfo, fetchInternal?: typeof fetch) => {
  return await callApi(input, undefined, fetchInternal);
};

export const callPostApi = async <T>(
  input: RequestInfo,
  payload: T,
  fetchInternal?: typeof fetch,
) => {
  return await callApi(
    input,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    fetchInternal,
  );
};
