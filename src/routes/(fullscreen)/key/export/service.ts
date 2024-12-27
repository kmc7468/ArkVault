import { callAPI } from "$lib/hooks";

export const requestPubKeyRegistration = async (pubKeyBase64: string) => {
  const res = await callAPI("/api/key/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pubKey: pubKeyBase64 }),
  });
  return res.ok;
};
