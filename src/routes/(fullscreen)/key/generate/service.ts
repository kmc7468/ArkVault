import {
  generateRSAEncKeyPair,
  generateRSASigKeyPair,
  makeRSAEncKeyNonextractable,
  makeRSASigKeyNonextractable,
  exportRSAKeyToBase64,
  generateAESKey,
  makeAESKeyNonextractable,
  exportAESKey,
} from "$lib/modules/crypto";
import { clientKeyStore, mekStore } from "$lib/stores";

export const generateClientKeys = async () => {
  const encKeyPair = await generateRSAEncKeyPair();
  const sigKeyPair = await generateRSASigKeyPair();

  clientKeyStore.set({
    encryptKey: encKeyPair.publicKey,
    decryptKey: await makeRSAEncKeyNonextractable(encKeyPair.privateKey, "private"),
    signKey: await makeRSASigKeyNonextractable(sigKeyPair.privateKey, "private"),
    verifyKey: sigKeyPair.publicKey,
  });

  return {
    encryptKeyBase64: await exportRSAKeyToBase64(encKeyPair.publicKey, "public"),
    decryptKeyBase64: await exportRSAKeyToBase64(encKeyPair.privateKey, "private"),
    signKeyBase64: await exportRSAKeyToBase64(sigKeyPair.privateKey, "private"),
    verifyKeyBase64: await exportRSAKeyToBase64(sigKeyPair.publicKey, "public"),
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
