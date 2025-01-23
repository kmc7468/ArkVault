<script lang="ts">
  import type { Writable } from "svelte/store";
  import { BottomSheet } from "$lib/components";
  import { Button } from "$lib/components/buttons";
  import { BottomDiv } from "$lib/components/divs";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import SubCategories from "$lib/molecules/SubCategories.svelte";
  import CreateCategoryModal from "$lib/organisms/CreateCategoryModal.svelte";
  import { masterKeyStore } from "$lib/stores";
  import { requestCategoryCreation } from "./service";

  interface Props {
    onAddToCategoryClick: (categoryId: number) => void;
    isOpen: boolean;
  }

  let { onAddToCategoryClick, isOpen = $bindable() }: Props = $props();

  let category: Writable<CategoryInfo | null> | undefined = $state();

  let isCreateCategoryModalOpen = $state(false);

  const createCategory = async (name: string) => {
    if (!$category) return; // TODO: Error handling

    await requestCategoryCreation(name, $category.id, $masterKeyStore?.get(1)!);
    isCreateCategoryModalOpen = false;
    category = getCategoryInfo($category.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
  };

  $effect(() => {
    if (isOpen) {
      category = getCategoryInfo("root", $masterKeyStore?.get(1)?.key!);
    }
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
        onSubCategoryCreateClick={() => (isCreateCategoryModalOpen = true)}
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

<CreateCategoryModal bind:isOpen={isCreateCategoryModalOpen} onCreateClick={createCategory} />
