import { callAPI } from "$lib/hooks";
import { storeMasterKeys } from "$lib/indexedDB";
import {
  decodeFromBase64,
  exportRSAKey,
  makeAESKeyNonextractable,
  unwrapAESKeyUsingRSA,
  digestSHA256,
} from "$lib/modules/crypto";
import { masterKeyStore } from "$lib/stores";

export const generateEncryptKeyFingerprint = async (encryptKey: CryptoKey) => {
  const { key } = await exportRSAKey(encryptKey);
  const digest = await digestSHA256(key);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .match(/.{1,4}/g)!
    .join(" ");
};

export const requestMasterKeyDownload = async (decryptKey: CryptoKey) => {
  const res = await callAPI("/api/mek/list", { method: "GET" });
  if (!res.ok) return false;

  const data = await res.json();
  const { meks: masterKeysWrapped } = data as {
    meks: {
      version: number;
      state: "active" | "retired";
      mek: string;
    }[];
  };
  const masterKeys = await Promise.all(
    masterKeysWrapped.map(async ({ version, state, mek: masterKeyWrapped }) => ({
      version,
      state,
      masterKey: await makeAESKeyNonextractable(
        await unwrapAESKeyUsingRSA(decodeFromBase64(masterKeyWrapped), decryptKey),
      ),
    })),
  );

  await storeMasterKeys(
    masterKeys.map(({ version, state, masterKey }) => ({ version, state, key: masterKey })),
  );
  masterKeyStore.set(
    new Map(masterKeys.map(({ version, state, masterKey }) => [version, { state, masterKey }])),
  );

  return true;
};
