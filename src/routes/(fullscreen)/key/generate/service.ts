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
import { keyPairsStore, mekStore } from "$lib/stores";

export const generateKeyPairs = async () => {
  const encKeyPair = await generateRSAEncKeyPair();
  const sigKeyPair = await generateRSASigKeyPair();

  keyPairsStore.set({
    encKeyPair: {
      publicKey: encKeyPair.publicKey,
      privateKey: await makeRSAEncKeyNonextractable(encKeyPair.privateKey, "private"),
    },
    sigKeyPair: {
      publicKey: sigKeyPair.publicKey,
      privateKey: await makeRSASigKeyNonextractable(sigKeyPair.privateKey, "private"),
    },
  });

  return {
    encKeyPair: {
      pubKeyBase64: await exportRSAKeyToBase64(encKeyPair.publicKey, "public"),
      privKeyBase64: await exportRSAKeyToBase64(encKeyPair.privateKey, "private"),
    },
    sigKeyPair: {
      pubKeyBase64: await exportRSAKeyToBase64(sigKeyPair.publicKey, "public"),
      privKeyBase64: await exportRSAKeyToBase64(sigKeyPair.privateKey, "private"),
    },
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
