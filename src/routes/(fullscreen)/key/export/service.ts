import { callPostApi } from "$lib/hooks";
import { storeClientKey } from "$lib/indexedDB";
import { signMasterKeyWrapped } from "$lib/modules/crypto";
import type { InitialMasterKeyRegisterRequest } from "$lib/server/schemas";
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
  masterKeyWrapped: string,
  signKey: CryptoKey,
) => {
  const res = await callPostApi<InitialMasterKeyRegisterRequest>("/api/mek/register/initial", {
    mek: masterKeyWrapped,
    mekSig: await signMasterKeyWrapped(1, masterKeyWrapped, signKey),
  });
  return res.ok || res.status === 409;
};
