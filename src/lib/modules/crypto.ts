export type RSAKeyType = "public" | "private";

export const encodeToBase64 = (data: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};

export const decodeFromBase64 = (data: string) => {
  return Uint8Array.from(atob(data), (c) => c.charCodeAt(0)).buffer;
};

export const generateRSAEncKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    } satisfies RsaHashedKeyGenParams,
    true,
    ["encrypt", "decrypt"],
  );
  return keyPair;
};

export const generateRSASigKeyPair = async () => {
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
  return keyPair;
};

export const makeRSAEncKeyNonextractable = async (key: CryptoKey, type: RSAKeyType) => {
  const { format, key: exportedKey } = await exportRSAKey(key, type);
  return await window.crypto.subtle.importKey(
    format,
    exportedKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    } satisfies RsaHashedImportParams,
    false,
    [type === "public" ? "encrypt" : "decrypt"],
  );
};

export const makeRSASigKeyNonextractable = async (key: CryptoKey, type: RSAKeyType) => {
  const { format, key: exportedKey } = await exportRSAKey(key, type);
  return await window.crypto.subtle.importKey(
    format,
    exportedKey,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    } satisfies RsaHashedImportParams,
    false,
    [type === "public" ? "verify" : "sign"],
  );
};

const exportRSAKey = async (key: CryptoKey, type: RSAKeyType) => {
  const format = type === "public" ? ("spki" as const) : ("pkcs8" as const);
  return {
    format,
    key: await window.crypto.subtle.exportKey(format, key),
  };
};

export const exportRSAKeyToBase64 = async (key: CryptoKey, type: RSAKeyType) => {
  return encodeToBase64((await exportRSAKey(key, type)).key);
};

export const encryptRSAPlaintext = async (plaintext: ArrayBuffer, publicKey: CryptoKey) => {
  return await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams,
    publicKey,
    plaintext,
  );
};

export const decryptRSACiphertext = async (ciphertext: ArrayBuffer, privateKey: CryptoKey) => {
  return await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams,
    privateKey,
    ciphertext,
  );
};

export const signRSAMessage = async (message: ArrayBuffer, privateKey: CryptoKey) => {
  return await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    } satisfies RsaPssParams,
    privateKey,
    message,
  );
};

export const generateAESKey = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    } satisfies AesKeyGenParams,
    true,
    ["encrypt", "decrypt"],
  );
};

export const makeAESKeyNonextractable = async (key: CryptoKey) => {
  return await window.crypto.subtle.importKey(
    "raw",
    await exportAESKey(key),
    {
      name: "AES-GCM",
      length: 256,
    } satisfies AesKeyAlgorithm,
    false,
    ["encrypt", "decrypt"],
  );
};

export const exportAESKey = async (key: CryptoKey) => {
  return await window.crypto.subtle.exportKey("raw", key);
};
