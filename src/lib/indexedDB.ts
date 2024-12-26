import { Dexie, type EntityTable } from "dexie";

interface ClientKeyPair {
  type: "publicKey" | "privateKey";
  key: CryptoKey;
}

const keyStore = new Dexie("keyStore") as Dexie & {
  clientKeyPairs: EntityTable<ClientKeyPair, "type">;
};

keyStore.version(1).stores({
  clientKeyPairs: "type",
});

export const getKeyPairFromIndexedDB = async () => {
  const pubKey = await keyStore.clientKeyPairs.get("publicKey");
  const privKey = await keyStore.clientKeyPairs.get("privateKey");
  return {
    pubKey: pubKey?.key ?? null,
    privKey: privKey?.key ?? null,
  };
};

export const storeKeyPairIntoIndexedDB = async (pubKey: CryptoKey, privKey: CryptoKey) => {
  await keyStore.clientKeyPairs.bulkPut([
    { type: "publicKey", key: pubKey },
    { type: "privateKey", key: privKey },
  ]);
};
