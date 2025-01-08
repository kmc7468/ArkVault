import { encodeString, encodeToBase64, decodeFromBase64 } from "./util";

export const generateEncryptionKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    } satisfies RsaHashedKeyGenParams,
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );
  return {
    encryptKey: keyPair.publicKey,
    decryptKey: keyPair.privateKey,
  };
};

export const generateSigningKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    } satisfies RsaHashedKeyGenParams,
    true,
    ["sign", "verify"],
  );
  return {
    signKey: keyPair.privateKey,
    verifyKey: keyPair.publicKey,
  };
};

export const exportRSAKey = async (key: CryptoKey) => {
  const format = key.type === "public" ? ("spki" as const) : ("pkcs8" as const);
  return {
    key: await window.crypto.subtle.exportKey(format, key),
    format,
  };
};

export const exportRSAKeyToBase64 = async (key: CryptoKey) => {
  return encodeToBase64((await exportRSAKey(key)).key);
};

export const makeRSAKeyNonextractable = async (key: CryptoKey) => {
  const { key: exportedKey, format } = await exportRSAKey(key);
  return await window.crypto.subtle.importKey(
    format,
    exportedKey,
    key.algorithm,
    false,
    key.usages,
  );
};

export const decryptChallenge = async (challenge: string, decryptKey: CryptoKey) => {
  return await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams,
    decryptKey,
    decodeFromBase64(challenge),
  );
};

export const wrapMasterKey = async (masterKey: CryptoKey, encryptKey: CryptoKey) => {
  return encodeToBase64(
    await window.crypto.subtle.wrapKey("raw", masterKey, encryptKey, {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams),
  );
};

export const unwrapMasterKey = async (
  masterKeyWrapped: string,
  decryptKey: CryptoKey,
  extractable = false,
) => {
  return {
    masterKey: await window.crypto.subtle.unwrapKey(
      "raw",
      decodeFromBase64(masterKeyWrapped),
      decryptKey,
      {
        name: "RSA-OAEP",
      } satisfies RsaOaepParams,
      "AES-KW",
      extractable,
      ["wrapKey", "unwrapKey"],
    ),
  };
};

export const signMessage = async (message: BufferSource, signKey: CryptoKey) => {
  return await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32, // SHA-256
    } satisfies RsaPssParams,
    signKey,
    message,
  );
};

export const verifySignature = async (
  message: BufferSource,
  signature: BufferSource,
  verifyKey: CryptoKey,
) => {
  return await window.crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32, // SHA-256
    } satisfies RsaPssParams,
    verifyKey,
    signature,
    message,
  );
};

export const signMasterKeyWrapped = async (
  masterKeyWrapped: string,
  masterKeyVersion: number,
  signKey: CryptoKey,
) => {
  const serialized = JSON.stringify({
    version: masterKeyVersion,
    key: masterKeyWrapped,
  });
  return encodeToBase64(await signMessage(encodeString(serialized), signKey));
};

export const verifyMasterKeyWrapped = async (
  masterKeyWrapped: string,
  masterKeyVersion: number,
  masterKeyWrappedSig: string,
  verifyKey: CryptoKey,
) => {
  const serialized = JSON.stringify({
    version: masterKeyVersion,
    key: masterKeyWrapped,
  });
  return await verifySignature(
    encodeString(serialized),
    decodeFromBase64(masterKeyWrappedSig),
    verifyKey,
  );
};
