import { encodeToBase64, exportRSAKey } from "$lib/modules/crypto";
import { requestPubKeyRegistration } from "../../key/export/service";

const callLoginAPI = async (email: string, password: string, pubKeyBase64?: string) => {
  return await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      pubKey: pubKeyBase64,
    }),
  });
};

export const requestLogin = async (
  email: string,
  password: string,
  keyPair: CryptoKeyPair | null,
  registerPubKey = true,
): Promise<boolean> => {
  const pubKeyBase64 = keyPair
    ? encodeToBase64((await exportRSAKey(keyPair.publicKey, "public")).key)
    : undefined;
  let loginRes = await callLoginAPI(email, password, pubKeyBase64);
  if (loginRes.ok) {
    return true;
  } else if (loginRes.status !== 401 || !keyPair || !registerPubKey) {
    return false;
  }

  const { message } = await loginRes.json();
  if (message !== "Unregistered public key") {
    return false;
  }

  loginRes = await callLoginAPI(email, password);
  if (!loginRes.ok) {
    return false;
  }

  if (await requestPubKeyRegistration(pubKeyBase64!, keyPair.privateKey)) {
    return requestLogin(email, password, keyPair, false);
  } else {
    return false;
  }
};
