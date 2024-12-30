import { Dexie, type EntityTable } from "dexie";

type RSAKeyUsage = "encrypt" | "decrypt" | "sign" | "verify";

interface RSAKey {
  usage: RSAKeyUsage;
  key: CryptoKey;
}

const keyStore = new Dexie("keyStore") as Dexie & {
  rsaKey: EntityTable<RSAKey, "usage">;
};

keyStore.version(1).stores({
  rsaKey: "usage",
});

export const getRSAKey = async (usage: RSAKeyUsage) => {
  const key = await keyStore.rsaKey.get(usage);
  return key?.key ?? null;
};

export const storeRSAKey = async (key: CryptoKey, usage: RSAKeyUsage) => {
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
  await keyStore.rsaKey.put({ usage, key });
};
