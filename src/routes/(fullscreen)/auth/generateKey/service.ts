import { storeKeyPairIntoIndexedDB } from "$lib/indexedDB";

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

const exportKeyAsPem = async (key: CryptoKey, type: KeyType) => {
  const exportedKey = await window.crypto.subtle.exportKey(
    type === "public" ? "spki" : "pkcs8",
    key,
  );
  const exportedKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)))
    .match(/.{1,64}/g)!
    .join("\n");

  const pemHeader = type === "public" ? "PUBLIC" : "PRIVATE";
  const pem = `-----BEGIN ${pemHeader} KEY-----\n${exportedKeyBase64}\n-----END ${pemHeader} KEY-----\n`;
  return pem;
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

export const generateKeyPair = async () => {
  const keyPair = await generateRSAKeyPair();

  const privKeySecure = await makeRSAKeyNonextractable(keyPair.privateKey, "private");
  await storeKeyPairIntoIndexedDB(keyPair.publicKey, privKeySecure);

  const pubKeyPem = await exportKeyAsPem(keyPair.publicKey, "public");
  const privKeyPem = await exportKeyAsPem(keyPair.privateKey, "private");
  return { pubKeyPem, privKeyPem };
};
