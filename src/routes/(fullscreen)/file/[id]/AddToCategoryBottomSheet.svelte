<script lang="ts">
  import type { Writable } from "svelte/store";
  import { BottomDiv, BottomSheet, Button, FullscreenDiv } from "$lib/components/atoms";
  import { SubCategories } from "$lib/components/molecules";
  import { CategoryCreateModal } from "$lib/components/organisms";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import { masterKeyStore } from "$lib/stores";
  import { requestCategoryCreation } from "./service";

  interface Props {
    onAddToCategoryClick: (categoryId: number) => void;
    isOpen: boolean;
  }

  let { onAddToCategoryClick, isOpen = $bindable() }: Props = $props();

  let category: Writable<CategoryInfo | null> | undefined = $state();

  let isCategoryCreateModalOpen = $state(false);

  $effect(() => {
    if (isOpen) {
      category = getCategoryInfo("root", $masterKeyStore?.get(1)?.key!);
    }
  });
</script>

{#if $category}
  <BottomSheet bind:isOpen class="flex flex-col">
    <FullscreenDiv>
      <SubCategories
        class="py-4"
        info={$category}
        onSubCategoryClick={({ id }) =>
          (category = getCategoryInfo(id, $masterKeyStore?.get(1)?.key!))}
        onSubCategoryCreateClick={() => (isCategoryCreateModalOpen = true)}
        subCategoryCreatePosition="top"
      />
      {#if $category.id !== "root"}
        <BottomDiv>
          <Button onclick={() => onAddToCategoryClick($category.id)} class="w-full">
            이 카테고리에 추가하기
          </Button>
        </BottomDiv>
      {/if}
    </FullscreenDiv>
  </BottomSheet>
{/if}

<CategoryCreateModal
  bind:isOpen={isCategoryCreateModalOpen}
  onCreateClick={async (name: string) => {
    if (await requestCategoryCreation(name, $category!.id, $masterKeyStore?.get(1)!)) {
      category = getCategoryInfo($category!.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
      return true;
    }
    return false;
  }}
/>
