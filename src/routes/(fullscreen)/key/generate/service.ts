import {
  generateRSAKeyPair,
  makeRSAKeyNonextractable,
  exportRSAKeyToBase64,
  generateAESKey,
  makeAESKeyNonextractable,
  exportAESKey,
} from "$lib/modules/crypto";
import { clientKeyStore, mekStore } from "$lib/stores";

export const generateClientKeys = async () => {
  const encKeyPair = await generateRSAKeyPair("encryption");
  const sigKeyPair = await generateRSAKeyPair("signature");

  clientKeyStore.set({
    encryptKey: encKeyPair.publicKey,
    decryptKey: await makeRSAKeyNonextractable(encKeyPair.privateKey),
    signKey: await makeRSAKeyNonextractable(sigKeyPair.privateKey),
    verifyKey: sigKeyPair.publicKey,
  });

  return {
    encryptKeyBase64: await exportRSAKeyToBase64(encKeyPair.publicKey),
    decryptKeyBase64: await exportRSAKeyToBase64(encKeyPair.privateKey),
    signKeyBase64: await exportRSAKeyToBase64(sigKeyPair.privateKey),
    verifyKeyBase64: await exportRSAKeyToBase64(sigKeyPair.publicKey),
  };
};

export const generateMekDraft = async () => {
  const mek = await generateAESKey();
  const mekSecured = await makeAESKeyNonextractable(mek);

  mekStore.update((meks) => {
    meks.set(0, mekSecured);
    return meks;
  });

  return {
    mekDraft: await exportAESKey(mek),
  };
};
