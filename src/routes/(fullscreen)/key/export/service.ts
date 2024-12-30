import { callAPI } from "$lib/hooks";
import { storeRSAKey } from "$lib/indexedDB";
import { encodeToBase64, encryptRSAPlaintext } from "$lib/modules/crypto";

export { requestTokenUpgrade } from "$lib/services/auth";
export { requestClientRegistration } from "$lib/services/key";

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

export const storeKeyPairsPersistently = async (
  encKeyPair: CryptoKeyPair,
  sigKeyPair: CryptoKeyPair,
) => {
  await storeRSAKey(encKeyPair.publicKey, "encrypt");
  await storeRSAKey(encKeyPair.privateKey, "decrypt");
  await storeRSAKey(sigKeyPair.publicKey, "verify");
  await storeRSAKey(sigKeyPair.privateKey, "sign");
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
