import { callAPI } from "$lib/hooks";
import { storeKeyPairIntoIndexedDB } from "$lib/indexedDB";

export const createBlobFromKeyPairBase64 = (pubKeyBase64: string, privKeyBase64: string) => {
  const pubKeyFormatted = pubKeyBase64.match(/.{1,64}/g)?.join("\n");
  const privKeyFormatted = privKeyBase64.match(/.{1,64}/g)?.join("\n");
  if (!pubKeyFormatted || !privKeyFormatted) {
    throw new Error("Failed to format key pair");
  }

  const pubKeyPem = `-----BEGIN RSA PUBLIC KEY-----\n${pubKeyFormatted}\n-----END RSA PUBLIC KEY-----`;
  const privKeyPem = `-----BEGIN RSA PRIVATE KEY-----\n${privKeyFormatted}\n-----END RSA PRIVATE KEY-----`;
  return new Blob([`${pubKeyPem}\n${privKeyPem}\n`], { type: "text/plain" });
};

const decryptChallenge = async (challenge: string, privateKey: CryptoKey) => {
  const challengeBuffer = Uint8Array.from(atob(challenge), (c) => c.charCodeAt(0));
  const answer = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams,
    privateKey,
    challengeBuffer,
  );
  return btoa(String.fromCharCode(...new Uint8Array(answer)));
};

export const requestPubKeyRegistration = async (pubKeyBase64: string, privateKey: CryptoKey) => {
  let res = await callAPI("/api/key/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pubKey: pubKeyBase64 }),
  });
  if (!res.ok) return false;

  const data = await res.json();
  const challenge = data.challenge as string;
  const answer = await decryptChallenge(challenge, privateKey);

  res = await callAPI("/api/key/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answer }),
  });
  return res.ok;
};

export const storeKeyPairPersistently = async (keyPair: CryptoKeyPair) => {
  await storeKeyPairIntoIndexedDB(keyPair.publicKey, keyPair.privateKey);
};
