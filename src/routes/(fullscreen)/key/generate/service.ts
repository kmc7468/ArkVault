import {
  generateRSAKeyPair,
  makeRSAKeyNonextractable,
  exportRSAKeyToBase64,
  generateAESMasterKey,
  wrapAESMasterKey,
} from "$lib/modules/crypto";
import { clientKeyStore } from "$lib/stores";

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
    encryptKey: encKeyPair.publicKey,
    encryptKeyBase64: await exportRSAKeyToBase64(encKeyPair.publicKey),
    decryptKeyBase64: await exportRSAKeyToBase64(encKeyPair.privateKey),
    signKeyBase64: await exportRSAKeyToBase64(sigKeyPair.privateKey),
    verifyKeyBase64: await exportRSAKeyToBase64(sigKeyPair.publicKey),
  };
};

export const generateInitialMasterKey = async (encryptKey: CryptoKey) => {
  const masterKey = await generateAESMasterKey();
  return {
    masterKeyWrapped: await wrapAESMasterKey(masterKey, encryptKey),
  };
};
