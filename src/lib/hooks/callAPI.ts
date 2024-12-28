const refreshToken = async () => {
  return await fetch("/api/auth/refreshToken", { method: "POST" });
};

export const callAPI = async (input: RequestInfo, init?: RequestInit) => {
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
