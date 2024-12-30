import { writable } from "svelte/store";

interface KeyPairs {
  encKeyPair: CryptoKeyPair;
  sigKeyPair: CryptoKeyPair;
}

export const keyPairsStore = writable<KeyPairs | null>(null);
export const mekStore = writable<Map<number, CryptoKey>>(new Map());
