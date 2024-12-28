import { callAPI } from "$lib/hooks";
import { storeKeyPairIntoIndexedDB } from "$lib/indexedDB";

export const createBlobFromKeyPairBase64 = (pubKeyBase64: string, privKeyBase64: string) => {
  const pubKeyFormatted = pubKeyBase64.match(/.{1,64}/g)?.join("\n");
  const privKeyFormatted = privKeyBase64.match(/.{1,64}/g)?.join("\n");
  if (!pubKeyFormatted || !privKeyFormatted) {
    throw new Error("Failed to format key pair");
  }

  const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${pubKeyFormatted}\n-----END PUBLIC KEY-----`;
  const privKeyPem = `-----BEGIN PRIVATE KEY-----\n${privKeyFormatted}\n-----END PRIVATE KEY-----`;
  return new Blob([`${pubKeyPem}\n${privKeyPem}\n`], { type: "text/plain" });
};

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

export const storeKeyPairPersistently = async (keyPair: CryptoKeyPair) => {
  await storeKeyPairIntoIndexedDB(keyPair.publicKey, keyPair.privateKey);
};
