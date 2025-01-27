<script lang="ts">
  import type { Component } from "svelte";
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";
  import type { Writable } from "svelte/store";
  import { Categories, IconEntryButton, type SelectedCategory } from "$lib/components/molecules";
  import { getCategoryInfo, type CategoryInfo } from "$lib/modules/filesystem";
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
    <IconEntryButton
      icon={IconAddCircle}
      onclick={onSubCategoryCreateClick}
      class="h-12 w-full"
      iconClass="text-gray-600"
      textClass="text-gray-700"
    >
      카테고리 추가하기
    </IconEntryButton>
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
