import { callAPI } from "$lib/hooks";
import { storeClientKey } from "$lib/indexedDB";
import { encodeToBase64, signRequest, signMasterKeyWrapped } from "$lib/modules/crypto";
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
  await storeClientKey(clientKeys.encryptKey, "encrypt");
  await storeClientKey(clientKeys.decryptKey, "decrypt");
  await storeClientKey(clientKeys.signKey, "sign");
  await storeClientKey(clientKeys.verifyKey, "verify");
};

export const requestInitialMasterKeyRegistration = async (
  masterKeyWrapped: ArrayBuffer,
  signKey: CryptoKey,
) => {
  const res = await callAPI("/api/mek/register/initial", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: await signRequest(
      {
        mek: encodeToBase64(masterKeyWrapped),
        mekSig: await signMasterKeyWrapped(1, masterKeyWrapped, signKey),
      },
      signKey,
    ),
  });
  return res.ok || res.status === 409;
};
