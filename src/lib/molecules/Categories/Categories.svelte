<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { CategoryInfo } from "$lib/modules/filesystem";
  import Category from "./Category.svelte";
  import type { SelectedCategory } from "./service";

  interface Props {
    categories: Writable<CategoryInfo | null>[];
    onCategoryClick: (category: SelectedCategory) => void;
  }

  let { categories, onCategoryClick }: Props = $props();
</script>

{#if categories.length > 0}
  <div class="space-y-1">
    {#each categories as category}
      <Category info={category} onclick={onCategoryClick} />
    {/each}
  </div>
{/if}
