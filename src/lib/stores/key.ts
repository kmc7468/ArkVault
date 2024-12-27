import { writable } from "svelte/store";

export const pubKeyStore = writable<CryptoKey | null>(null);
export const privKeyStore = writable<CryptoKey | null>(null);
