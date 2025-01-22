<script lang="ts">
  import type { Writable } from "svelte/store";
  import { EntryButton } from "$lib/components/buttons";
  import {
    getFileInfo,
    getCategoryInfo,
    type FileInfo,
    type CategoryInfo,
  } from "$lib/modules/filesystem";
  import { masterKeyStore } from "$lib/stores";
  import File from "./File.svelte";
  import SubCategory from "./SubCategory.svelte";
  import type { SelectedSubCategory, SelectedFile } from "./service";

  import IconAddCircle from "~icons/material-symbols/add-circle";

  interface Props {
    info: CategoryInfo;
    onFileClick: (file: SelectedFile) => void;
    onSubCategoryClick: (subCategory: SelectedSubCategory) => void;
    onSubCategoryCreateClick: () => void;
  }

  let { info, onFileClick, onSubCategoryClick, onSubCategoryCreateClick }: Props = $props();

  let subCategories: Writable<CategoryInfo | null>[] = $state([]);
  let files: Writable<FileInfo | null>[] = $state([]);

  $effect(() => {
    subCategories = info.subCategoryIds.map((id) =>
      getCategoryInfo(id, $masterKeyStore?.get(1)?.key!),
    );
    files = info.files?.map((id) => getFileInfo(id, $masterKeyStore?.get(1)?.key!)) ?? [];

    // TODO: Sorting
  });
</script>

<div class="space-y-4">
  <div class="space-y-4 bg-white p-4">
    {#if info.id !== "root"}
      <p class="text-lg font-bold text-gray-800">하위 카테고리</p>
    {/if}
    <div class="space-y-1">
      {#key info}
        {#each subCategories as subCategory}
          <SubCategory info={subCategory} onclick={onSubCategoryClick} />
        {/each}
      {/key}
      <EntryButton onclick={onSubCategoryCreateClick}>
        <div class="flex h-8 items-center gap-x-4">
          <IconAddCircle class="text-lg text-gray-600" />
          <p class="font-medium text-gray-700">카테고리 추가하기</p>
        </div>
      </EntryButton>
    </div>
  </div>
  {#if info.id !== "root"}
    <div class="space-y-4 bg-white p-4">
      <p class="text-lg font-bold text-gray-800">파일</p>
      <div class="space-y-1">
        {#key info}
          {#each files as file}
            <File info={file} onclick={onFileClick} />
          {:else}
            <p>이 카테고리에 추가된 파일이 없어요.</p>
          {/each}
        {/key}
      </div>
    </div>
  {/if}
</div>
