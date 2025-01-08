import type { ClientInit } from "@sveltejs/kit";
import { getClientKey, getMasterKeys } from "$lib/indexedDB";
import { clientKeyStore, masterKeyStore } from "$lib/stores";

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

export const init: ClientInit = async () => {
  await Promise.all([prepareClientKeyStore(), prepareMasterKeyStore()]);
};
