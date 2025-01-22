<script lang="ts">
  import type { Writable } from "svelte/store";
  import {
    getFileInfo,
    getCategoryInfo,
    type FileInfo,
    type CategoryInfo,
  } from "$lib/modules/filesystem";
  import type { SelectedCategory } from "$lib/molecules/Categories";
  import SubCategories from "$lib/molecules/SubCategories.svelte";
  import { masterKeyStore } from "$lib/stores";
  import File from "./File.svelte";
  import type { SelectedFile } from "./service";

  interface Props {
    info: CategoryInfo;
    onFileClick: (file: SelectedFile) => void;
    onSubCategoryClick: (subCategory: SelectedCategory) => void;
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
    <SubCategories {info} {onSubCategoryClick} {onSubCategoryCreateClick} />
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
