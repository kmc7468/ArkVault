import { writable } from "svelte/store";

export const keyPairStore = writable<CryptoKeyPair | null>(null);
export const mekStore = writable<Map<number, CryptoKey>>(new Map());
