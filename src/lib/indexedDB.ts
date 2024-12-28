import { Dexie, type EntityTable } from "dexie";

interface KeyPair {
  type: "publicKey" | "privateKey";
  key: CryptoKey;
}

const keyStore = new Dexie("keyStore") as Dexie & {
  keyPair: EntityTable<KeyPair, "type">;
};

keyStore.version(1).stores({
  keyPair: "type",
});

export const getKeyPairFromIndexedDB = async () => {
  const pubKey = await keyStore.keyPair.get("publicKey");
  const privKey = await keyStore.keyPair.get("privateKey");
  return {
    pubKey: pubKey?.key ?? null,
    privKey: privKey?.key ?? null,
  };
};

export const storeKeyPairIntoIndexedDB = async (pubKey: CryptoKey, privKey: CryptoKey) => {
  if (!pubKey.extractable) throw new Error("Public key must be extractable");
  if (privKey.extractable) throw new Error("Private key must be non-extractable");

  await keyStore.keyPair.bulkPut([
    { type: "publicKey", key: pubKey },
    { type: "privateKey", key: privKey },
  ]);
};
