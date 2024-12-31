import { Dexie, type EntityTable } from "dexie";

type ClientKeyUsage = "encrypt" | "decrypt" | "sign" | "verify";

interface ClientKey {
  usage: ClientKeyUsage;
  key: CryptoKey;
}

type MasterKeyState = "active" | "retired";

interface MasterKey {
  version: number;
  state: MasterKeyState;
  key: CryptoKey;
}

const keyStore = new Dexie("keyStore") as Dexie & {
  clientKey: EntityTable<ClientKey, "usage">;
  masterKey: EntityTable<MasterKey, "version">;
};

keyStore.version(1).stores({
  clientKey: "usage",
  masterKey: "version",
});

export const getClientKey = async (usage: ClientKeyUsage) => {
  const key = await keyStore.clientKey.get(usage);
  return key?.key ?? null;
};

export const storeClientKey = async (key: CryptoKey, usage: ClientKeyUsage) => {
  switch (usage) {
    case "encrypt":
    case "verify":
      if (key.type !== "public") {
        throw new Error("Public key required");
      } else if (!key.extractable) {
        throw new Error("Public key must be extractable");
      }
      break;
    case "decrypt":
    case "sign":
      if (key.type !== "private") {
        throw new Error("Private key required");
      } else if (key.extractable) {
        throw new Error("Private key must be non-extractable");
      }
      break;
  }
  await keyStore.clientKey.put({ usage, key });
};

export const getMasterKeys = async () => {
  return await keyStore.masterKey.toArray();
};

export const storeMasterKeys = async (keys: MasterKey[]) => {
  if (keys.some(({ key }) => key.extractable)) {
    throw new Error("Master keys must be non-extractable");
  }
  await keyStore.masterKey.bulkPut(keys);
};
