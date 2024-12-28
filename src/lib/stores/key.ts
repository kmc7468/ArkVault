import { writable } from "svelte/store";

export const keyPairStore = writable<CryptoKeyPair | null>(null);
