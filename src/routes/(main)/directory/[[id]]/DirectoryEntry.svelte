<script lang="ts">
  import IconFolder from "~icons/material-symbols/folder";
  import IconDraft from "~icons/material-symbols/draft";
  import IconMoreVert from "~icons/material-symbols/more-vert";

  interface Props {
    name: string;
    onclick: () => void;
    onOpenMenuClick: () => void;
    type: "directory" | "file";
  }

  let { name, onclick, onOpenMenuClick, type }: Props = $props();

  const openMenu = (e: Event) => {
    e.stopPropagation();
    setTimeout(() => {
      onOpenMenuClick();
    }, 100);
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div id="button" onclick={() => setTimeout(onclick, 100)} class="h-12 w-full rounded-xl">
  <div id="button-content" class="flex h-full items-center gap-x-4 p-2 transition">
    <div class="flex-shrink-0 text-lg">
      {#if type === "directory"}
        <IconFolder />
      {:else if type === "file"}
        <IconDraft class="text-blue-400" />
      {/if}
    </div>
    <p title={name} class="flex-grow truncate font-medium">
      {name}
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

<style>
  #button:active:not(:has(#open-menu:active)) {
    @apply bg-gray-100;
  }
  #button-content:active:not(:has(#open-menu:active)) {
    @apply scale-95;
  }
</style>
