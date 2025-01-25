<script lang="ts">
  import { BottomSheet } from "$lib/components";
  import { EntryButton } from "$lib/components/atoms";

  import IconCreateNewFolder from "~icons/material-symbols/create-new-folder";
  import IconUploadFile from "~icons/material-symbols/upload-file";

  interface Props {
    isOpen: boolean;
    onDirectoryCreateClick: () => void;
    onFileUploadClick: () => void;
  }

  let { isOpen = $bindable(), onDirectoryCreateClick, onFileUploadClick }: Props = $props();
</script>

<BottomSheet bind:isOpen>
  <div class="w-full py-4">
    <EntryButton onclick={onDirectoryCreateClick} class="w-full">
      <div class="flex h-12 items-center gap-x-4">
        <IconCreateNewFolder class="text-2xl text-yellow-500" />
        <p class="font-medium">폴더 만들기</p>
      </div>
    </EntryButton>
    <EntryButton onclick={onFileUploadClick} class="w-full">
      <div class="flex h-12 items-center gap-x-4">
        <IconUploadFile class="text-2xl text-blue-400" />
        <p class="font-medium">파일 업로드</p>
      </div>
    </EntryButton>
  </div>
</BottomSheet>
