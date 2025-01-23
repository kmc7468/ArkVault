<script lang="ts">
  import { BottomSheet } from "$lib/components";
  import { EntryButton } from "$lib/components/buttons";
  import type { SelectedCategory } from "$lib/molecules/Categories";

  import IconCategory from "~icons/material-symbols/category";
  import IconEdit from "~icons/material-symbols/edit";
  import IconDelete from "~icons/material-symbols/delete";

  interface Props {
    onRenameClick: () => void;
    onDeleteClick: () => void;
    isOpen: boolean;
    selectedCategory: SelectedCategory | undefined;
  }

  let {
    onRenameClick,
    onDeleteClick,
    isOpen = $bindable(),
    selectedCategory = $bindable(),
  }: Props = $props();

  const closeBottomSheet = () => {
    isOpen = false;
    selectedCategory = undefined;
  };
</script>

<BottomSheet bind:isOpen onclose={closeBottomSheet}>
  <div class="w-full py-4">
    {#if selectedCategory}
      {@const { name } = selectedCategory}
      <div class="flex h-12 items-center gap-x-4 p-2">
        <div class="flex-shrink-0 text-lg">
          <IconCategory />
        </div>
        <p title={name} class="flex-grow truncate font-semibold">
          {name}
        </p>
      </div>
      <div class="my-2 h-px w-full bg-gray-200"></div>
    {/if}
    <EntryButton onclick={onRenameClick}>
      <div class="flex h-8 items-center gap-x-4">
        <IconEdit class="text-lg" />
        <p class="font-medium">이름 바꾸기</p>
      </div>
    </EntryButton>
    <EntryButton onclick={onDeleteClick}>
      <div class="flex h-8 items-center gap-x-4 text-red-500">
        <IconDelete class="text-lg" />
        <p class="font-medium">삭제하기</p>
      </div>
    </EntryButton>
  </div>
</BottomSheet>
