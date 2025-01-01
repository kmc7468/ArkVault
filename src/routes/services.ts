import { getClientKey, getMasterKeys } from "$lib/indexedDB";
import { clientKeyStore, masterKeyStore } from "$lib/stores";

export const prepareClientKeyStore = async () => {
  const encryptKey = await getClientKey("encrypt");
  const decryptKey = await getClientKey("decrypt");
  const signKey = await getClientKey("sign");
  const verifyKey = await getClientKey("verify");
  if (encryptKey && decryptKey && signKey && verifyKey) {
    clientKeyStore.set({ encryptKey, decryptKey, signKey, verifyKey });
    return true;
  } else {
    return false;
  }
};

export const prepareMasterKeyStore = async () => {
  const masterKeys = await getMasterKeys();
  if (masterKeys.length > 0) {
    masterKeyStore.set(
      new Map(masterKeys.map(({ version, state, key }) => [version, { version, state, key }])),
    );
    return true;
  } else {
    return false;
  }
};
