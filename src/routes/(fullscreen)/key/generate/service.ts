import {
  encodeToBase64,
  generateRSAEncKeyPair,
  generateRSASigKeyPair,
  makeRSAKeyNonextractable,
  exportRSAKey,
  generateAESKey,
  makeAESKeyNonextractable,
  exportAESKey,
} from "$lib/modules/crypto";
import { keyPairsStore, mekStore } from "$lib/stores";

const exportRSAKeyToBase64 = async (key: CryptoKey, type: "public" | "private") => {
  return encodeToBase64((await exportRSAKey(key, type)).key);
};

export const generateKeyPairs = async () => {
  const encKeyPair = await generateRSAEncKeyPair();
  const sigKeyPair = await generateRSASigKeyPair();

  keyPairsStore.set({
    encKeyPair: {
      publicKey: encKeyPair.publicKey,
      privateKey: await makeRSAKeyNonextractable(encKeyPair.privateKey, "private"),
    },
    sigKeyPair: {
      publicKey: sigKeyPair.publicKey,
      privateKey: await makeRSAKeyNonextractable(sigKeyPair.privateKey, "private"),
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
