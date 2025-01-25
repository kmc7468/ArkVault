<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { DirectoryInfo } from "$lib/modules/filesystem";
  import type { SelectedEntry } from "../service.svelte";

  import IconFolder from "~icons/material-symbols/folder";
  import IconMoreVert from "~icons/material-symbols/more-vert";

  type SubDirectoryInfo = DirectoryInfo & { id: number };

  interface Props {
    info: Writable<DirectoryInfo | null>;
    onclick: (selectedEntry: SelectedEntry) => void;
    onOpenMenuClick: (selectedEntry: SelectedEntry) => void;
  }

  let { info, onclick, onOpenMenuClick }: Props = $props();

  const openDirectory = () => {
    const { id, dataKey, dataKeyVersion, name } = $info as SubDirectoryInfo;
    if (!dataKey || !dataKeyVersion) return; // TODO: Error handling

    setTimeout(() => {
      onclick({ type: "directory", id, dataKey, dataKeyVersion, name });
    }, 100);
  };

  const openMenu = (e: Event) => {
    e.stopPropagation();

    const { id, dataKey, dataKeyVersion, name } = $info as SubDirectoryInfo;
    if (!dataKey || !dataKeyVersion) return; // TODO: Error handling

    setTimeout(() => {
      onOpenMenuClick({ type: "directory", id, dataKey, dataKeyVersion, name });
    }, 100);
  };
</script>

{#if $info}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div id="button" onclick={openDirectory} class="h-14 rounded-xl">
    <div id="button-content" class="flex h-full items-center gap-x-4 p-2 transition">
      <div class="flex-shrink-0 text-lg">
        <IconFolder />
      </div>
      <p title={$info.name} class="flex-grow truncate font-medium">
        {$info.name}
      </p>
      <button
        id="open-menu"
        onclick={openMenu}
        class="flex-shrink-0 rounded-full p-1 active:bg-gray-100"
      >
        <IconMoreVert class="text-lg" />
      </button>
    </div>
  </div>
{/if}

<style>
  #button:active:not(:has(#open-menu:active)) {
    @apply bg-gray-100;
  }
  #button-content:active:not(:has(#open-menu:active)) {
    @apply scale-95;
  }
</style>
