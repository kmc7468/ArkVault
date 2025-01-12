import {
  generateEncryptionKeyPair,
  generateSigningKeyPair,
  exportRSAKeyToBase64,
  makeRSAKeyNonextractable,
  wrapMasterKey,
  generateMasterKey,
  makeAESKeyNonextractable,
  wrapHmacSecret,
  generateHmacSecret,
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
    masterKey: await makeAESKeyNonextractable(masterKey),
    masterKeyWrapped: await wrapMasterKey(masterKey, encryptKey),
  };
};

export const generateInitialHmacSecret = async (masterKey: CryptoKey) => {
  const { hmacSecret } = await generateHmacSecret();
  return {
    hmacSecretWrapped: await wrapHmacSecret(hmacSecret, masterKey),
  };
};
