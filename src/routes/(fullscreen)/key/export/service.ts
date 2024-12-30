import { callAPI } from "$lib/hooks";
import { storeRSAKey } from "$lib/indexedDB";
import { encodeToBase64, encryptRSAPlaintext, signRSAMessage } from "$lib/modules/crypto";
import type { ClientKeys } from "$lib/stores";

export { requestTokenUpgrade } from "$lib/services/auth";
export { requestClientRegistration } from "$lib/services/key";

type ExportedKeyPairs = {
  generator: "ArkVault";
  exportedAt: Date;
} & {
  version: 1;
  encryptKey: string;
  decryptKey: string;
  signKey: string;
  verifyKey: string;
};

export const exportClientKeys = (
  encryptKeyBase64: string,
  decryptKeyBase64: string,
  signKeyBase64: string,
  verifyKeyBase64: string,
) => {
  return {
    version: 1,
    generator: "ArkVault",
    exportedAt: new Date(),
    encryptKey: encryptKeyBase64,
    decryptKey: decryptKeyBase64,
    signKey: signKeyBase64,
    verifyKey: verifyKeyBase64,
  } satisfies ExportedKeyPairs;
};

export const storeClientKeys = async (clientKeys: ClientKeys) => {
  await storeRSAKey(clientKeys.encryptKey, "encrypt");
  await storeRSAKey(clientKeys.decryptKey, "decrypt");
  await storeRSAKey(clientKeys.signKey, "sign");
  await storeRSAKey(clientKeys.verifyKey, "verify");
};

export const requestInitialMekRegistration = async (
  mekDraft: ArrayBuffer,
  encryptKey: CryptoKey,
  signKey: CryptoKey,
) => {
  const mekDraftEncrypted = await encryptRSAPlaintext(mekDraft, encryptKey);
  const mekDraftEncryptedSigned = await signRSAMessage(mekDraftEncrypted, signKey);
  const res = await callAPI("/api/mek/register/initial", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mek: encodeToBase64(mekDraftEncrypted),
      sigMek: encodeToBase64(mekDraftEncryptedSigned),
    }),
  });
  return res.ok || res.status === 409;
};
