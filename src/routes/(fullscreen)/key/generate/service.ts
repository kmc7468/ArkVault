import {
  generateEncryptionKeyPair,
  generateSigningKeyPair,
  exportRSAKeyToBase64,
  makeRSAKeyNonextractable,
  generateMasterKey,
  wrapMasterKey,
} from "$lib/modules/crypto";
import { clientKeyStore } from "$lib/stores";

export const generateClientKeys = async () => {
  const { encryptKey, decryptKey } = await generateEncryptionKeyPair();
  const { signKey, verifyKey } = await generateSigningKeyPair();

  clientKeyStore.set({
    encryptKey,
    decryptKey: await makeRSAKeyNonextractable(decryptKey),
    signKey: await makeRSAKeyNonextractable(signKey),
    verifyKey,
  });

  return {
    encryptKey,
    encryptKeyBase64: await exportRSAKeyToBase64(encryptKey),
    decryptKeyBase64: await exportRSAKeyToBase64(decryptKey),
    signKeyBase64: await exportRSAKeyToBase64(signKey),
    verifyKeyBase64: await exportRSAKeyToBase64(verifyKey),
  };
};

export const generateInitialMasterKey = async (encryptKey: CryptoKey) => {
  const { masterKey } = await generateMasterKey();
  return {
    masterKeyWrapped: await wrapMasterKey(masterKey, encryptKey),
  };
};
