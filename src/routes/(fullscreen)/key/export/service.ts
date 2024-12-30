import { callAPI } from "$lib/hooks";
import { storeRSAKey } from "$lib/indexedDB";
import {
  encodeToBase64,
  decodeFromBase64,
  encryptRSAPlaintext,
  decryptRSACiphertext,
  signRSAMessage,
} from "$lib/modules/crypto";

type ExportedKeyPairs = {
  generator: "ArkVault";
  exportedAt: Date;
} & {
  version: 1;
  encKeyPair: { pubKey: string; privKey: string };
  sigKeyPair: { pubKey: string; privKey: string };
};

export const makeKeyPairsSaveable = (
  encKeyPair: { pubKeyBase64: string; privKeyBase64: string },
  sigKeyPair: { pubKeyBase64: string; privKeyBase64: string },
) => {
  return {
    version: 1,
    generator: "ArkVault",
    exportedAt: new Date(),
    encKeyPair: {
      pubKey: encKeyPair.pubKeyBase64,
      privKey: encKeyPair.privKeyBase64,
    },
    sigKeyPair: {
      pubKey: sigKeyPair.pubKeyBase64,
      privKey: sigKeyPair.privKeyBase64,
    },
  } satisfies ExportedKeyPairs;
};

export const requestClientRegistration = async (
  encPubKeyBase64: string,
  encPrivKey: CryptoKey,
  sigPubKeyBase64: string,
  sigPrivKey: CryptoKey,
) => {
  let res = await callAPI("/api/client/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      encPubKey: encPubKeyBase64,
      sigPubKey: sigPubKeyBase64,
    }),
  });
  if (!res.ok) return false;

  const { challenge } = await res.json();
  const answer = await decryptRSACiphertext(decodeFromBase64(challenge), encPrivKey);
  const sigAnswer = await signRSAMessage(answer, sigPrivKey);

  res = await callAPI("/api/client/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer: encodeToBase64(answer),
      sigAnswer: encodeToBase64(sigAnswer),
    }),
  });
  return res.ok;
};

export const storeKeyPairsPersistently = async (
  encKeyPair: CryptoKeyPair,
  sigKeyPair: CryptoKeyPair,
) => {
  await storeRSAKey(encKeyPair.publicKey, "encrypt");
  await storeRSAKey(encKeyPair.privateKey, "decrypt");
  await storeRSAKey(sigKeyPair.publicKey, "verify");
  await storeRSAKey(sigKeyPair.privateKey, "sign");
};

export const requestTokenUpgrade = async (
  encPubKeyBase64: string,
  encPrivKey: CryptoKey,
  sigPubKeyBase64: string,
  sigPrivKey: CryptoKey,
) => {
  let res = await fetch("/api/auth/upgradeToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      encPubKey: encPubKeyBase64,
      sigPubKey: sigPubKeyBase64,
    }),
  });
  if (!res.ok) return false;

  const { challenge } = await res.json();
  const answer = await decryptRSACiphertext(decodeFromBase64(challenge), encPrivKey);
  const sigAnswer = await signRSAMessage(answer, sigPrivKey);

  res = await fetch("/api/auth/upgradeToken/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer: encodeToBase64(answer),
      sigAnswer: encodeToBase64(sigAnswer),
    }),
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
