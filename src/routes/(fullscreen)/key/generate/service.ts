import { storeKeyPairIntoIndexedDB } from "$lib/indexedDB";
import { pubKey, privKey } from "$lib/stores/key";

type KeyType = "public" | "private";

const generateRSAKeyPair = async () => {
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

const makeRSAKeyNonextractable = async (key: CryptoKey, type: KeyType) => {
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

const exportKeyToBase64 = async (key: CryptoKey, type: KeyType) => {
  const exportedKey = await window.crypto.subtle.exportKey(
    type === "public" ? "spki" : "pkcs8",
    key,
  );
  return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
};

export const generateKeyPair = async () => {
  const keyPair = await generateRSAKeyPair();
  const privKeySecure = await makeRSAKeyNonextractable(keyPair.privateKey, "private");

  pubKey.set(keyPair.publicKey);
  privKey.set(privKeySecure);

  await storeKeyPairIntoIndexedDB(keyPair.publicKey, privKeySecure);

  return {
    pubKeyBase64: await exportKeyToBase64(keyPair.publicKey, "public"),
    privKeyBase64: await exportKeyToBase64(keyPair.privateKey, "private"),
  };
};
