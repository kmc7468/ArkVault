<script lang="ts">
  import type { Component } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { Writable } from "svelte/store";
  import type { CategoryInfo } from "$lib/modules/filesystem";
  import Category from "./Category.svelte";
  import type { SelectedCategory } from "./service";

  interface Props {
    categories: Writable<CategoryInfo | null>[];
    categoryMenuIcon?: Component<SvelteHTMLElements["svg"]>;
    onCategoryClick: (category: SelectedCategory) => void;
    onCategoryMenuClick?: (category: SelectedCategory) => void;
  }

  let { categories, categoryMenuIcon, onCategoryClick, onCategoryMenuClick }: Props = $props();
</script>

{#if categories.length > 0}
  <div class="space-y-1">
    {#each categories as category}
      <Category
        info={category}
        menuIcon={categoryMenuIcon}
        onclick={onCategoryClick}
        onMenuClick={onCategoryMenuClick}
      />
    {/each}
  </div>
{/if}
