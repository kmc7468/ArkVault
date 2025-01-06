<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { FileInfo } from "$lib/stores";
  import type { SelectedDirectoryEntry } from "../service";

  import IconDraft from "~icons/material-symbols/draft";
  import IconMoreVert from "~icons/material-symbols/more-vert";

  interface Props {
    info: Writable<FileInfo | null>;
    onclick: (selectedEntry: SelectedDirectoryEntry) => void;
    onOpenMenuClick: (selectedEntry: SelectedDirectoryEntry) => void;
  }

  let { info, onclick, onOpenMenuClick }: Props = $props();

  const openFile = () => {
    const { id, dataKey, dataKeyVersion, name } = $info!;
    setTimeout(() => {
      onclick({ type: "file", id, dataKey, dataKeyVersion, name });
    }, 100);
  };

  const openMenu = (e: Event) => {
    e.stopPropagation();

    const { id, dataKey, dataKeyVersion, name } = $info!;
    setTimeout(() => {
      onOpenMenuClick({ type: "file", id, dataKey, dataKeyVersion, name });
    }, 100);
  };
</script>

{#if $info}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div id="button" onclick={openFile} class="h-12 w-full rounded-xl">
    <div id="button-content" class="flex h-full items-center gap-x-4 p-2 transition">
      <div class="flex-shrink-0 text-lg">
        <IconDraft class="text-blue-400" />
      </div>
      <p title={$info.name} class="flex-grow truncate font-medium">
        {$info.name}
      </p>
      <button
        id="open-menu"
        onclick={openMenu}
        class="flex-shrink-0 rounded-full p-1 active:bg-gray-100"
      >
        <IconMoreVert class="text-lg transition active:scale-95" />
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
