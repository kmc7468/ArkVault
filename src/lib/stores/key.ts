import { writable } from "svelte/store";

export const pubKey = writable<CryptoKey | null>(null);
export const privKey = writable<CryptoKey | null>(null);
