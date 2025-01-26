<script lang="ts">
  import type { Component } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { Writable } from "svelte/store";
  import { ActionEntryButton } from "$lib/components/atoms";
  import { CategoryLabel } from "$lib/components/molecules";
  import type { CategoryInfo } from "$lib/modules/filesystem";
  import type { SelectedCategory } from "./service";

  interface Props {
    info: Writable<CategoryInfo | null>;
    menuIcon?: Component<SvelteHTMLElements["svg"]>;
    onclick: (category: SelectedCategory) => void;
    onMenuClick?: (category: SelectedCategory) => void;
  }

  let { info, menuIcon, onclick, onMenuClick }: Props = $props();

  const openCategory = () => {
    const { id, dataKey, dataKeyVersion, name } = $info as CategoryInfo;
    if (!dataKey || !dataKeyVersion) return; // TODO: Error handling

    onclick({ id, dataKey, dataKeyVersion, name });
  };

  const openMenu = () => {
    const { id, dataKey, dataKeyVersion, name } = $info as CategoryInfo;
    if (!dataKey || !dataKeyVersion) return; // TODO: Error handling

    onMenuClick!({ id, dataKey, dataKeyVersion, name });
  };
</script>

{#if $info}
  <ActionEntryButton
    class="h-12"
    onclick={openCategory}
    actionButtonIcon={menuIcon}
    onActionButtonClick={openMenu}
  >
    <CategoryLabel name={$info.name!} />
  </ActionEntryButton>
{/if}
