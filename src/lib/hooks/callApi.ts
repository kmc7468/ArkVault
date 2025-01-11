export const callGetApi = async (input: RequestInfo, fetchInternal = fetch) => {
  return await fetchInternal(input);
};

export const callPostApi = async <T>(input: RequestInfo, payload?: T, fetchInternal = fetch) => {
  return await fetchInternal(input, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
};
