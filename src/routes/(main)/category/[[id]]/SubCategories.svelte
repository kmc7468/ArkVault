<script lang="ts">
  import type { Writable } from "svelte/store";
  import { EntryButton } from "$lib/components/buttons";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import { masterKeyStore } from "$lib/stores";
  import type { SelectedSubCategory } from "./service";
  import SubCategory from "./SubCategory.svelte";

  import IconAddCircle from "~icons/material-symbols/add-circle";

  interface Props {
    info: CategoryInfo;
    onCategoryClick: (category: SelectedSubCategory) => void;
    onCategoryCreateClick: () => void;
  }

  let { info, onCategoryClick, onCategoryCreateClick }: Props = $props();

  let subCategories: Writable<CategoryInfo | null>[] = $state([]);

  $effect(() => {
    subCategories = info.subCategoryIds.map((id) => {
      const info = getCategoryInfo(id, $masterKeyStore?.get(1)?.key!);
      return info;
    });

    // TODO: Sorting
  });
</script>

<div class="space-y-1">
  {#each subCategories as subCategory}
    <SubCategory info={subCategory} onclick={onCategoryClick} />
  {/each}
  <EntryButton onclick={onCategoryCreateClick}>
    <div class="flex h-8 items-center gap-x-4">
      <IconAddCircle class="text-lg text-gray-600" />
      <p class="font-medium text-gray-700">카테고리 추가하기</p>
    </div>
  </EntryButton>
</div>
