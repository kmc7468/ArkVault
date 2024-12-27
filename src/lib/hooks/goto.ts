import { writable } from "svelte/store";
import { goto as svelteGoto } from "$app/navigation";

type Path = "/key/export";

interface KeyExportState {
  pubKeyBase64: string;
  privKeyBase64: string;
}

export const keyExportState = writable<KeyExportState | null>(null);

export function goto(path: "/key/export", state: KeyExportState): Promise<void>;

export function goto(path: Path, state: unknown) {
  switch (path) {
    case "/key/export":
      keyExportState.set(state as KeyExportState);
      return svelteGoto(path);
  }
}
