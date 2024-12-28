export type RSAKeyType = "public" | "private";

export const generateRSAKeyPair = async () => {
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

export const makeRSAKeyNonextractable = async (key: CryptoKey, type: RSAKeyType) => {
  const format = type === "public" ? "spki" : "pkcs8";
  const keyUsage = type === "public" ? "encrypt" : "decrypt";
  return await window.crypto.subtle.importKey(
    format,
    await window.crypto.subtle.exportKey(format, key),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    } satisfies RsaHashedImportParams,
    false,
    [keyUsage],
  );
};

export const exportRSAKeyToBase64 = async (key: CryptoKey, type: RSAKeyType) => {
  const exportedKey = await window.crypto.subtle.exportKey(
    type === "public" ? "spki" : "pkcs8",
    key,
  );
  return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
};

export const decryptRSACiphertext = async (ciphertext: string, privateKey: CryptoKey) => {
  const ciphertextBuffer = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    } satisfies RsaOaepParams,
    privateKey,
    ciphertextBuffer,
  );
  return btoa(String.fromCharCode(...new Uint8Array(plaintext)));
};
