<script lang="ts">
  import type { Writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import { masterKeyStore } from "$lib/stores";
  import CreateCategoryModal from "./CreateCategoryModal.svelte";
  import SubCategories from "./SubCategories.svelte";
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
  {#if $info}
    <div class="flex-grow space-y-4 bg-gray-100">
      <div class="space-y-4 bg-white p-4">
        {#if data.id !== "root"}
          <p class="text-lg font-bold text-gray-800">하위 카테고리</p>
        {/if}
        {#key $info}
          <SubCategories
            info={$info}
            onCategoryClick={({ id }) => goto(`/category/${id}`)}
            onCategoryCreateClick={() => {
              isCreateCategoryModalOpen = true;
            }}
          />
        {/key}
      </div>
      {#if data.id !== "root"}
        <div class="space-y-4 bg-white p-4">
          <p class="text-lg font-bold text-gray-800">파일</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<CreateCategoryModal bind:isOpen={isCreateCategoryModalOpen} onCreateClick={createCategory} />
