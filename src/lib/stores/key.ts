import { writable } from "svelte/store";

export interface ClientKeys {
  encryptKey: CryptoKey;
  decryptKey: CryptoKey;
  signKey: CryptoKey;
  verifyKey: CryptoKey;
}

export interface MasterKey {
  version: number;
  state: "active" | "retired" | "dead";
  key: CryptoKey;
}

export const clientKeyStore = writable<ClientKeys | null>(null);

export const masterKeyStore = writable<Map<number, MasterKey> | null>(null);
