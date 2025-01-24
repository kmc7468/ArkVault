<script lang="ts">
  import type { Writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { CategoryCreateModal, RenameModal } from "$lib/components/organisms";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import type { SelectedCategory } from "$lib/molecules/Categories";
  import Category from "$lib/organisms/Category";
  import { masterKeyStore } from "$lib/stores";
  import CategoryMenuBottomSheet from "./CategoryMenuBottomSheet.svelte";
  import DeleteCategoryModal from "./DeleteCategoryModal.svelte";
  import {
    requestCategoryCreation,
    requestFileRemovalFromCategory,
    requestCategoryRename,
    requestCategoryDeletion,
  } from "./service";

  let { data } = $props();

  let info: Writable<CategoryInfo | null> | undefined = $state();
  let selectedSubCategory: SelectedCategory | undefined = $state();

  let isFileRecursive = $state(false);

  let isCategoryCreateModalOpen = $state(false);
  let isSubCategoryMenuBottomSheetOpen = $state(false);
  let isCategoryRenameModalOpen = $state(false);
  let isDeleteCategoryModalOpen = $state(false);

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
        bind:isFileRecursive
        info={$info}
        onFileClick={({ id }) => goto(`/file/${id}`)}
        onFileRemoveClick={async ({ id }) => {
          await requestFileRemovalFromCategory(id, data.id as number);
          info = getCategoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
        }}
        onSubCategoryClick={({ id }) => goto(`/category/${id}`)}
        onSubCategoryCreateClick={() => (isCategoryCreateModalOpen = true)}
        onSubCategoryMenuClick={(subCategory) => {
          selectedSubCategory = subCategory;
          isSubCategoryMenuBottomSheetOpen = true;
        }}
      />
    {/if}
  </div>
</div>

<CategoryCreateModal
  bind:isOpen={isCategoryCreateModalOpen}
  oncreate={async (name: string) => {
    if (await requestCategoryCreation(name, data.id, $masterKeyStore?.get(1)!)) {
      info = getCategoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
      return true;
    }
    return false;
  }}
/>

<CategoryMenuBottomSheet
  bind:isOpen={isSubCategoryMenuBottomSheetOpen}
  bind:selectedCategory={selectedSubCategory}
  onRenameClick={() => {
    isSubCategoryMenuBottomSheetOpen = false;
    isCategoryRenameModalOpen = true;
  }}
  onDeleteClick={() => {
    isSubCategoryMenuBottomSheetOpen = false;
    isDeleteCategoryModalOpen = true;
  }}
/>
<RenameModal
  bind:isOpen={isCategoryRenameModalOpen}
  onbeforeclose={() => (selectedSubCategory = undefined)}
  originalName={selectedSubCategory?.name}
  onrename={async (newName: string) => {
    if (await requestCategoryRename(selectedSubCategory!, newName)) {
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
