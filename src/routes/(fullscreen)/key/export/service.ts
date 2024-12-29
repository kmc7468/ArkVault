import { callAPI } from "$lib/hooks";
import { storeKeyPairIntoIndexedDB } from "$lib/indexedDB";
import {
  encodeToBase64,
  decodeFromBase64,
  encryptRSAPlaintext,
  decryptRSACiphertext,
} from "$lib/modules/crypto";

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

export const requestPubKeyRegistration = async (pubKeyBase64: string, privateKey: CryptoKey) => {
  let res = await callAPI("/api/client/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pubKey: pubKeyBase64 }),
  });
  if (!res.ok) return false;

  const data = await res.json();
  const challenge = data.challenge as string;
  const answer = await decryptRSACiphertext(decodeFromBase64(challenge), privateKey);

  res = await callAPI("/api/client/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answer: encodeToBase64(answer) }),
  });
  return res.ok;
};

export const storeKeyPairPersistently = async (keyPair: CryptoKeyPair) => {
  await storeKeyPairIntoIndexedDB(keyPair.publicKey, keyPair.privateKey);
};

export const requestTokenUpgrade = async (pubKeyBase64: string) => {
  const res = await fetch("/api/auth/upgradeToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pubKey: pubKeyBase64 }),
  });
  return res.ok;
};

export const requestInitialMekRegistration = async (
  mekDraft: ArrayBuffer,
  publicKey: CryptoKey,
) => {
  const mekDraftEncrypted = await encryptRSAPlaintext(mekDraft, publicKey);
  const res = await callAPI("/api/mek/register/initial", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mek: encodeToBase64(mekDraftEncrypted) }),
  });
  return res.ok || res.status === 403;
};
