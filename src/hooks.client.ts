import type { ClientInit } from "@sveltejs/kit";
import { getClientKey, getMasterKeys, getHmacSecrets } from "$lib/indexedDB";
import { clientKeyStore, masterKeyStore, hmacSecretStore } from "$lib/stores";

const prepareClientKeyStore = async () => {
  const [encryptKey, decryptKey, signKey, verifyKey] = await Promise.all([
    getClientKey("encrypt"),
    getClientKey("decrypt"),
    getClientKey("sign"),
    getClientKey("verify"),
  ]);
  if (encryptKey && decryptKey && signKey && verifyKey) {
    clientKeyStore.set({ encryptKey, decryptKey, signKey, verifyKey });
  }
};

const prepareMasterKeyStore = async () => {
  const masterKeys = await getMasterKeys();
  if (masterKeys.length > 0) {
    masterKeyStore.set(new Map(masterKeys.map((masterKey) => [masterKey.version, masterKey])));
  }
};

const prepareHmacSecretStore = async () => {
  const hmacSecrets = await getHmacSecrets();
  if (hmacSecrets.length > 0) {
    hmacSecretStore.set(new Map(hmacSecrets.map((hmacSecret) => [hmacSecret.version, hmacSecret])));
  }
};

export const init: ClientInit = async () => {
  await Promise.all([prepareClientKeyStore(), prepareMasterKeyStore(), prepareHmacSecretStore()]);
};
