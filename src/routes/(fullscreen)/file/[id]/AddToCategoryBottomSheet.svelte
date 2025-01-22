<script lang="ts">
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import { BottomSheet } from "$lib/components";
  import { Button } from "$lib/components/buttons";
  import { BottomDiv } from "$lib/components/divs";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import SubCategories from "$lib/molecules/SubCategories.svelte";
  import { masterKeyStore } from "$lib/stores";

  interface Props {
    onAddToCategoryClick: (categoryId: number) => void;
    isOpen: boolean;
  }

  let { onAddToCategoryClick, isOpen = $bindable() }: Props = $props();

  let category: Writable<CategoryInfo | null> | undefined = $state();

  onMount(() => {
    category = getCategoryInfo("root", $masterKeyStore?.get(1)?.key!);
  });
</script>

<BottomSheet bind:isOpen>
  <div class="flex w-full flex-col justify-between">
    {#if $category}
      <SubCategories
        class="h-fit py-4"
        info={$category}
        onSubCategoryClick={({ id }) =>
          (category = getCategoryInfo(id, $masterKeyStore?.get(1)?.key!))}
        subCategoryCreatePosition="top"
      />
      {#if $category.id !== "root"}
        <BottomDiv>
          <Button onclick={() => onAddToCategoryClick($category.id)}>이 카테고리에 추가하기</Button>
        </BottomDiv>
      {/if}
    {/if}
  </div>
</BottomSheet>
