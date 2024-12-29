import {
  encodeToBase64,
  generateRSAKeyPair,
  makeRSAKeyNonextractable,
  exportRSAKey,
  generateAESKey,
  makeAESKeyNonextractable,
  exportAESKey,
} from "$lib/modules/crypto";
import { keyPairStore, mekStore } from "$lib/stores";

export const generateKeyPair = async () => {
  const keyPair = await generateRSAKeyPair();
  const privKeySecured = await makeRSAKeyNonextractable(keyPair.privateKey, "private");

  keyPairStore.set({
    publicKey: keyPair.publicKey,
    privateKey: privKeySecured,
  });

  return {
    pubKeyBase64: encodeToBase64((await exportRSAKey(keyPair.publicKey, "public")).key),
    privKeyBase64: encodeToBase64((await exportRSAKey(keyPair.privateKey, "private")).key),
  };
};

export const generateMekDraft = async () => {
  const mek = await generateAESKey();
  const mekSecured = await makeAESKeyNonextractable(mek);

  mekStore.update((meks) => {
    meks.set(meks.size, mekSecured);
    return meks;
  });

  return {
    mekDraft: await exportAESKey(mek),
  };
};
