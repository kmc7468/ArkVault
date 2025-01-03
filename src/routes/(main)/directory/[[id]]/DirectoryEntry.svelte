<script lang="ts">
  import { goto } from "$app/navigation";

  import IconFolder from "~icons/material-symbols/folder";
  import IconMoreVert from "~icons/material-symbols/more-vert";

  interface Props {
    id: number;
    name: string;
  }

  let { id, name }: Props = $props();

  const openDirectory = () => {
    setTimeout(() => {
      goto(`/directory/${id}`);
    }, 100);
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div id="button" onclick={openDirectory} class="h-12 w-full rounded-xl">
  <div id="button-content" class="flex h-full items-center justify-between p-2 transition">
    <div class="flex items-center gap-x-2">
      <IconFolder class="text-lg" />
      <p class="font-medium">{name}</p>
    </div>
    <button
      id="open-menu"
      onclick={(e) => e.stopPropagation()}
      class="rounded-full p-1 active:bg-gray-100"
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
