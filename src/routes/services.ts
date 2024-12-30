import { getRSAKey } from "$lib/indexedDB";
import { clientKeyStore } from "$lib/stores";

export const prepareClientKeyStore = async () => {
  const encryptKey = await getRSAKey("encrypt");
  const decryptKey = await getRSAKey("decrypt");
  const signKey = await getRSAKey("sign");
  const verifyKey = await getRSAKey("verify");
  if (encryptKey && decryptKey && signKey && verifyKey) {
    clientKeyStore.set({ encryptKey, decryptKey, signKey, verifyKey });
    return true;
  } else {
    return false;
  }
};
