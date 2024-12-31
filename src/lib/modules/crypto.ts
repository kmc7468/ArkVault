export type RSAKeyPurpose = "encryption" | "signature";
export type RSAKeyType = "public" | "private";

export const encodeToBase64 = (data: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};

export const decodeFromBase64 = (data: string) => {
  return Uint8Array.from(atob(data), (c) => c.charCodeAt(0)).buffer;
};

export const generateRSAKeyPair = async (purpose: RSAKeyPurpose) => {
  return await window.crypto.subtle.generateKey(
    {
      name: purpose === "encryption" ? "RSA-OAEP" : "RSA-PSS",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    } satisfies RsaHashedKeyGenParams,
    true,
    purpose === "encryption" ? ["encrypt", "decrypt", "wrapKey", "unwrapKey"] : ["sign", "verify"],
  );
};

export const makeRSAKeyNonextractable = async (key: CryptoKey) => {
  const { format, key: exportedKey } = await exportRSAKey(key);
  return await window.crypto.subtle.importKey(
    format,
    exportedKey,
    key.algorithm,
    false,
    key.usages,
  );
};

export const exportRSAKey = async (key: CryptoKey) => {
  const format = key.type === "public" ? ("spki" as const) : ("pkcs8" as const);
  return {
    format,
    key: await window.crypto.subtle.exportKey(format, key),
  };
};

export const exportRSAKeyToBase64 = async (key: CryptoKey) => {
  return encodeToBase64((await exportRSAKey(key)).key);
};

export const encryptRSAPlaintext = async (plaintext: BufferSource, publicKey: CryptoKey) => {
  return await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams,
    publicKey,
    plaintext,
  );
};

export const decryptRSACiphertext = async (ciphertext: BufferSource, privateKey: CryptoKey) => {
  return await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams,
    privateKey,
    ciphertext,
  );
};

export const signRSAMessage = async (message: BufferSource, privateKey: CryptoKey) => {
  return await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    } satisfies RsaPssParams,
    privateKey,
    message,
  );
};

export const verifyRSASignature = async (
  message: BufferSource,
  signature: BufferSource,
  publicKey: CryptoKey,
) => {
  return await window.crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32,
    } satisfies RsaPssParams,
    publicKey,
    signature,
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
    key.algorithm,
    false,
    key.usages,
  );
};

export const exportAESKey = async (key: CryptoKey) => {
  return await window.crypto.subtle.exportKey("raw", key);
};

export const wrapAESKeyUsingRSA = async (aesKey: CryptoKey, rsaPublicKey: CryptoKey) => {
  return await window.crypto.subtle.wrapKey("raw", aesKey, rsaPublicKey, {
    name: "RSA-OAEP",
  } satisfies RsaOaepParams);
};

export const unwrapAESKeyUsingRSA = async (wrappedKey: BufferSource, rsaPrivateKey: CryptoKey) => {
  return await window.crypto.subtle.unwrapKey(
    "raw",
    wrappedKey,
    rsaPrivateKey,
    {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams,
    {
      name: "AES-GCM",
      length: 256,
    } satisfies AesKeyGenParams,
    true,
    ["encrypt", "decrypt"],
  );
};

export const digestSHA256 = async (data: BufferSource) => {
  return await window.crypto.subtle.digest("SHA-256", data);
};

export const signRequest = async <T>(data: T, privateKey: CryptoKey) => {
  const dataBuffer = new TextEncoder().encode(JSON.stringify(data));
  const signature = await signRSAMessage(dataBuffer, privateKey);
  return JSON.stringify({
    data,
    signature: encodeToBase64(signature),
  });
};

export const signMasterKeyWrapped = async (
  version: number,
  masterKeyWrapped: ArrayBuffer,
  privateKey: CryptoKey,
) => {
  const data = JSON.stringify({ version, key: encodeToBase64(masterKeyWrapped) });
  const dataBuffer = new TextEncoder().encode(data);
  return encodeToBase64(await signRSAMessage(dataBuffer, privateKey));
};

export const verifyMasterKeyWrappedSig = async (
  version: number,
  masterKeyWrappedBase64: string,
  masterKeyWrappedSig: string,
  publicKey: CryptoKey,
) => {
  const data = JSON.stringify({ version, key: masterKeyWrappedBase64 });
  const dataBuffer = new TextEncoder().encode(data);
  return await verifyRSASignature(dataBuffer, decodeFromBase64(masterKeyWrappedSig), publicKey);
};
