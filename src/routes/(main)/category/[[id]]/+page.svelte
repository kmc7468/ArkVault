<script lang="ts">
  import type { Writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import Category from "$lib/organisms/Category";
  import { masterKeyStore } from "$lib/stores";
  import CreateCategoryModal from "./CreateCategoryModal.svelte";
  import { requestCategoryCreation } from "./service";

  let { data } = $props();

  let info: Writable<CategoryInfo | null> | undefined = $state();

  let isCreateCategoryModalOpen = $state(false);

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
        onSubCategoryClick={({ id }) => goto(`/category/${id}`)}
        onSubCategoryCreateClick={() => (isCreateCategoryModalOpen = true)}
        onFileClick={({ id }) => goto(`/file/${id}`)}
      />
    {/if}
  </div>
</div>

<CreateCategoryModal bind:isOpen={isCreateCategoryModalOpen} onCreateClick={createCategory} />
