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

export interface HmacSecret {
  version: number;
  state: "active";
  secret: CryptoKey;
}

export const clientKeyStore = writable<ClientKeys | null>(null);

export const masterKeyStore = writable<Map<number, MasterKey> | null>(null);

export const hmacSecretStore = writable<Map<number, HmacSecret> | null>(null);
