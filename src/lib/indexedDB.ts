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
  rsaKey: "usage, key",
});

export const getRSAKey = async (usage: RSAKeyUsage) => {
  const key = await keyStore.rsaKey.get(usage);
  return key?.key ?? null;
};

export const storeRSAKey = async (key: CryptoKey, usage: RSAKeyUsage) => {
  if ((usage === "encrypt" || usage === "verify") && !key.extractable) {
    throw new Error("Public key must be extractable");
  } else if ((usage === "decrypt" || usage === "sign") && key.extractable) {
    throw new Error("Private key must be non-extractable");
  }

  await keyStore.rsaKey.put({ usage, key });
};
