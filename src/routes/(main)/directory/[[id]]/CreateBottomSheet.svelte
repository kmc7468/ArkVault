<script lang="ts">
  import { BottomSheet } from "$lib/components";
  import { EntryButton } from "$lib/components/buttons";

  import IconCreateNewFolder from "~icons/material-symbols/create-new-folder";
  import IconUploadFile from "~icons/material-symbols/upload-file";

  interface Props {
    onDirectoryCreateClick: () => void;
    onFileUploadClick: () => void;
    isOpen: boolean;
  }

  let { onDirectoryCreateClick, onFileUploadClick, isOpen = $bindable() }: Props = $props();
</script>

<BottomSheet bind:isOpen>
  <div class="w-full py-4">
    <EntryButton onclick={onDirectoryCreateClick}>
      <div class="flex h-12 items-center gap-x-4">
        <IconCreateNewFolder class="text-2xl text-yellow-500" />
        <p class="font-medium">폴더 만들기</p>
      </div>
    </EntryButton>
    <EntryButton onclick={onFileUploadClick}>
      <div class="flex h-12 items-center gap-x-4">
        <IconUploadFile class="text-2xl text-blue-400" />
        <p class="font-medium">파일 업로드</p>
      </div>
    </EntryButton>
  </div>
</BottomSheet>
