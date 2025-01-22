<script lang="ts">
  import type { Component } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { Writable } from "svelte/store";
  import type { CategoryInfo } from "$lib/modules/filesystem";
  import type { SelectedCategory } from "./service";

  import IconCategory from "~icons/material-symbols/category";

  interface Props {
    info: Writable<CategoryInfo | null>;
    menuIcon?: Component<SvelteHTMLElements["svg"]>;
    onclick: (category: SelectedCategory) => void;
    onMenuClick?: (category: SelectedCategory) => void;
  }

  let { info, menuIcon: MenuIcon, onclick, onMenuClick }: Props = $props();

  const openCategory = () => {
    const { id, dataKey, dataKeyVersion, name } = $info as CategoryInfo;
    if (!dataKey || !dataKeyVersion) return; // TODO: Error handling

    setTimeout(() => {
      onclick({ id, dataKey, dataKeyVersion, name });
    }, 100);
  };

  const openMenu = (e: Event) => {
    e.stopPropagation();

    const { id, dataKey, dataKeyVersion, name } = $info as CategoryInfo;
    if (!dataKey || !dataKeyVersion) return; // TODO: Error handling

    setTimeout(() => {
      onMenuClick!({ id, dataKey, dataKeyVersion, name });
    }, 100);
  };
</script>

{#if $info}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div id="button" onclick={openCategory} class="h-12 rounded-xl">
    <div id="button-content" class="flex h-full items-center gap-x-4 p-2 transition">
      <div class="flex-shrink-0 text-lg">
        <IconCategory />
      </div>
      <p title={$info.name} class="flex-grow truncate font-medium">
        {$info.name}
      </p>
      {#if MenuIcon && onMenuClick}
        <button
          id="open-menu"
          onclick={openMenu}
          class="flex-shrink-0 rounded-full p-1 active:bg-gray-100"
        >
          <MenuIcon class="text-lg" />
        </button>
      {/if}
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
