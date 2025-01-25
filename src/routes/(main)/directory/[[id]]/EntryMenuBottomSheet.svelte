<script lang="ts">
  import { BottomSheet } from "$lib/components";
  import { EntryButton } from "$lib/components/atoms";
  import { useContext } from "./service.svelte";

  import IconFolder from "~icons/material-symbols/folder";
  import IconDraft from "~icons/material-symbols/draft";
  import IconEdit from "~icons/material-symbols/edit";
  import IconDelete from "~icons/material-symbols/delete";

  interface Props {
    isOpen: boolean;
    onDeleteClick: () => void;
    onRenameClick: () => void;
  }

  let { isOpen = $bindable(), onDeleteClick, onRenameClick }: Props = $props();
  let context = useContext();
</script>

{#if context.selectedEntry}
  {@const { name, type } = context.selectedEntry}
  <BottomSheet bind:isOpen>
    <div class="w-full py-4">
      <div class="flex h-12 items-center gap-x-4 p-2">
        <div class="flex-shrink-0 text-lg">
          {#if type === "directory"}
            <IconFolder />
          {:else}
            <IconDraft class="text-blue-400" />
          {/if}
        </div>
        <p title={name} class="flex-grow truncate font-semibold">
          {name}
        </p>
      </div>
      <div class="my-2 h-px w-full bg-gray-200"></div>
      <EntryButton onclick={onRenameClick} class="w-full">
        <div class="flex h-8 items-center gap-x-4">
          <IconEdit class="text-lg" />
          <p class="font-medium">이름 바꾸기</p>
        </div>
      </EntryButton>
      <EntryButton onclick={onDeleteClick} class="w-full">
        <div class="flex h-8 items-center gap-x-4 text-red-500">
          <IconDelete class="text-lg" />
          <p class="font-medium">삭제하기</p>
        </div>
      </EntryButton>
    </div>
  </BottomSheet>
{/if}
