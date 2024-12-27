import { error } from "@sveltejs/kit";
import { get } from "svelte/store";
import { keyExportState } from "$lib/hooks/goto";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  const state = get(keyExportState);
  if (!state) {
    error(403, "Forbidden");
  }

  keyExportState.set(null);
  return state;
};
