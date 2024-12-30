import { writable } from "svelte/store";

export interface ClientKeys {
  encryptKey: CryptoKey;
  decryptKey: CryptoKey;
  signKey: CryptoKey;
  verifyKey: CryptoKey;
}

export const clientKeyStore = writable<ClientKeys | null>(null);
export const mekStore = writable<Map<number, CryptoKey>>(new Map());
