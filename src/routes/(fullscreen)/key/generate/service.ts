import {
  generateRSAKeyPair,
  makeRSAKeyNonextractable,
  exportRSAKeyToBase64,
} from "$lib/modules/crypto";
import { keyPairStore } from "$lib/stores";

export const generateKeyPair = async () => {
  const keyPair = await generateRSAKeyPair();
  const privKeySecured = await makeRSAKeyNonextractable(keyPair.privateKey, "private");

  keyPairStore.set({
    publicKey: keyPair.publicKey,
    privateKey: privKeySecured,
  });

  return {
    pubKeyBase64: await exportRSAKeyToBase64(keyPair.publicKey, "public"),
    privKeyBase64: await exportRSAKeyToBase64(keyPair.privateKey, "private"),
  };
};
