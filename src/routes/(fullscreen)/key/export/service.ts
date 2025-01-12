import { callPostApi } from "$lib/hooks";
import { storeClientKey } from "$lib/indexedDB";
import { signMasterKeyWrapped } from "$lib/modules/crypto";
import type {
  InitialMasterKeyRegisterRequest,
  InitialHmacSecretRegisterRequest,
} from "$lib/server/schemas";
import type { ClientKeys } from "$lib/stores";

export { requestSessionUpgrade } from "$lib/services/auth";
export { requestClientRegistration } from "$lib/services/key";

type SerializedKeyPairs = {
  generator: "ArkVault";
  exportedAt: Date;
} & {
  version: 1;
  encryptKey: string;
  decryptKey: string;
  signKey: string;
  verifyKey: string;
};

export const serializeClientKeys = (
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
  } satisfies SerializedKeyPairs;
};

export const storeClientKeys = async (clientKeys: ClientKeys) => {
  await Promise.all([
    storeClientKey(clientKeys.encryptKey, "encrypt"),
    storeClientKey(clientKeys.decryptKey, "decrypt"),
    storeClientKey(clientKeys.signKey, "sign"),
    storeClientKey(clientKeys.verifyKey, "verify"),
  ]);
};

export const requestInitialMasterKeyAndHmacSecretRegistration = async (
  masterKeyWrapped: string,
  hmacSecretWrapped: string,
  signKey: CryptoKey,
) => {
  let res = await callPostApi<InitialMasterKeyRegisterRequest>("/api/mek/register/initial", {
    mek: masterKeyWrapped,
    mekSig: await signMasterKeyWrapped(masterKeyWrapped, 1, signKey),
  });
  if (!res.ok) {
    return res.status === 409;
  }

  res = await callPostApi<InitialHmacSecretRegisterRequest>("/api/hsk/register/initial", {
    mekVersion: 1,
    hsk: hmacSecretWrapped,
  });
  return res.ok;
};
