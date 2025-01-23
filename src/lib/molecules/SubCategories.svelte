<script lang="ts">
  import type { Component } from "svelte";
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";
  import type { Writable } from "svelte/store";
  import { EntryButton } from "$lib/components/buttons";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import Categories, { type SelectedCategory } from "$lib/molecules/Categories";
  import { masterKeyStore } from "$lib/stores";

  import IconAddCircle from "~icons/material-symbols/add-circle";

  interface Props {
    class?: ClassValue;
    info: CategoryInfo;
    onSubCategoryClick: (subCategory: SelectedCategory) => void;
    onSubCategoryCreateClick: () => void;
    onSubCategoryMenuClick?: (category: SelectedCategory) => void;
    subCategoryCreatePosition?: "top" | "bottom";
    subCategoryMenuIcon?: Component<SvelteHTMLElements["svg"]>;
  }

  let {
    info,
    onSubCategoryClick,
    onSubCategoryCreateClick,
    onSubCategoryMenuClick,
    subCategoryCreatePosition = "bottom",
    subCategoryMenuIcon,
    ...props
  }: Props = $props();

  let subCategories: Writable<CategoryInfo | null>[] = $state([]);

  $effect(() => {
    subCategories = info.subCategoryIds.map((id) =>
      getCategoryInfo(id, $masterKeyStore?.get(1)?.key!),
    );
  });
</script>

<div class={["space-y-1", props.class]}>
  {#snippet subCategoryCreate()}
    <EntryButton onclick={onSubCategoryCreateClick}>
      <div class="flex h-8 items-center gap-x-4">
        <IconAddCircle class="text-lg text-gray-600" />
        <p class="font-medium text-gray-700">카테고리 추가하기</p>
      </div>
    </EntryButton>
  {/snippet}

  {#if subCategoryCreatePosition === "top"}
    {@render subCategoryCreate()}
  {/if}
  {#key info}
    <Categories
      categories={subCategories}
      categoryMenuIcon={subCategoryMenuIcon}
      onCategoryClick={onSubCategoryClick}
      onCategoryMenuClick={onSubCategoryMenuClick}
    />
  {/key}
  {#if subCategoryCreatePosition === "bottom"}
    {@render subCategoryCreate()}
  {/if}
</div>
