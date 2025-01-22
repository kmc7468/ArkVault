<script lang="ts">
  import type { Writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import type { SelectedCategory } from "$lib/molecules/Categories";
  import Category from "$lib/organisms/Category";
  import CreateCategoryModal from "$lib/organisms/CreateCategoryModal.svelte";
  import { masterKeyStore } from "$lib/stores";
  import CategoryMenuBottomSheet from "./CategoryMenuBottomSheet.svelte";
  import DeleteCategoryModal from "./DeleteCategoryModal.svelte";
  import RenameCategoryModal from "./RenameCategoryModal.svelte";
  import {
    requestCategoryCreation,
    requestFileRemovalFromCategory,
    requestCategoryRename,
    requestCategoryDeletion,
  } from "./service";

  let { data } = $props();

  let info: Writable<CategoryInfo | null> | undefined = $state();
  let selectedSubCategory: SelectedCategory | undefined = $state();

  let isCreateCategoryModalOpen = $state(false);
  let isSubCategoryMenuBottomSheetOpen = $state(false);
  let isRenameCategoryModalOpen = $state(false);
  let isDeleteCategoryModalOpen = $state(false);

  const createCategory = async (name: string) => {
    await requestCategoryCreation(name, data.id, $masterKeyStore?.get(1)!);
    isCreateCategoryModalOpen = false;
    info = getCategoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
  };

  $effect(() => {
    info = getCategoryInfo(data.id, $masterKeyStore?.get(1)?.key!);
  });
</script>

<svelte:head>
  <title>카테고리</title>
</svelte:head>

<div class="flex min-h-full flex-col">
  {#if data.id !== "root"}
    <TopBar title={$info?.name} xPadding />
  {/if}
  <div class="flex-grow bg-gray-100 pb-[5.5em]">
    {#if $info}
      <Category
        info={$info}
        onFileClick={({ id }) => goto(`/file/${id}`)}
        onFileRemoveClick={({ id }) => {
          requestFileRemovalFromCategory(id, data.id as number);
          info = getCategoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
        }}
        onSubCategoryClick={({ id }) => goto(`/category/${id}`)}
        onSubCategoryCreateClick={() => (isCreateCategoryModalOpen = true)}
        onSubCategoryMenuClick={(subCategory) => {
          selectedSubCategory = subCategory;
          isSubCategoryMenuBottomSheetOpen = true;
        }}
      />
    {/if}
  </div>
</div>

<CreateCategoryModal bind:isOpen={isCreateCategoryModalOpen} onCreateClick={createCategory} />

<CategoryMenuBottomSheet
  bind:isOpen={isSubCategoryMenuBottomSheetOpen}
  bind:selectedCategory={selectedSubCategory}
  onRenameClick={() => {
    isSubCategoryMenuBottomSheetOpen = false;
    isRenameCategoryModalOpen = true;
  }}
  onDeleteClick={() => {
    isSubCategoryMenuBottomSheetOpen = false;
    isDeleteCategoryModalOpen = true;
  }}
/>
<RenameCategoryModal
  bind:isOpen={isRenameCategoryModalOpen}
  bind:selectedCategory={selectedSubCategory}
  onRenameClick={async (newName) => {
    if (selectedSubCategory) {
      await requestCategoryRename(selectedSubCategory, newName);
      info = getCategoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
      return true;
    }
    return false;
  }}
/>
<DeleteCategoryModal
  bind:isOpen={isDeleteCategoryModalOpen}
  bind:selectedCategory={selectedSubCategory}
  onDeleteClick={async () => {
    if (selectedSubCategory) {
      await requestCategoryDeletion(selectedSubCategory);
      info = getCategoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
      return true;
    }
    return false;
  }}
/>
