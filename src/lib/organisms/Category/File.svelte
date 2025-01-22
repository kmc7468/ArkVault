<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { FileInfo } from "$lib/modules/filesystem";
  import type { SelectedFile } from "./service";

  import IconDraft from "~icons/material-symbols/draft";
  import IconClose from "~icons/material-symbols/close";

  interface Props {
    info: Writable<FileInfo | null>;
    onclick: (selectedFile: SelectedFile) => void;
    onRemoveClick: (selectedFile: SelectedFile) => void;
  }

  let { info, onclick, onRemoveClick }: Props = $props();

  const openFile = () => {
    const { id, dataKey, dataKeyVersion, name } = $info as FileInfo;
    if (!dataKey || !dataKeyVersion) return; // TODO: Error handling

    setTimeout(() => {
      onclick({ id, dataKey, dataKeyVersion, name });
    }, 100);
  };

  const removeFile = (e: Event) => {
    e.stopPropagation();

    const { id, dataKey, dataKeyVersion, name } = $info as FileInfo;
    if (!dataKey || !dataKeyVersion) return; // TODO: Error handling

    setTimeout(() => {
      onRemoveClick({ id, dataKey, dataKeyVersion, name });
    }, 100);
  };
</script>

{#if $info}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div id="button" onclick={openFile} class="h-12 rounded-xl">
    <div id="button-content" class="flex h-full items-center gap-x-4 p-2 transition">
      <div class="flex-shrink-0 text-lg text-blue-400">
        <IconDraft />
      </div>
      <p title={$info.name} class="flex-grow truncate font-medium">
        {$info.name}
      </p>
      <button
        id="remove-file"
        onclick={removeFile}
        class="flex-shrink-0 rounded-full p-1 active:bg-gray-100"
      >
        <IconClose class="text-lg" />
      </button>
    </div>
  </div>
{/if}

<style>
  #button:active:not(:has(#remove-file:active)) {
    @apply bg-gray-100;
  }
  #button-content:active:not(:has(#remove-file:active)) {
    @apply scale-95;
  }
</style>
