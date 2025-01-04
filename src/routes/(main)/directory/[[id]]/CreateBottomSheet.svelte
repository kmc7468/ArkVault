<script lang="ts">
  import { BottomSheet } from "$lib/components";
  import { EntryButton } from "$lib/components/buttons";

  import IconCreateNewFolder from "~icons/material-symbols/create-new-folder";
  import IconUploadFile from "~icons/material-symbols/upload-file";

  interface Props {
    onDirectoryCreate: () => void;
    onFileUpload: () => void;
    isOpen: boolean;
  }

  let { onDirectoryCreate, onFileUpload, isOpen = $bindable() }: Props = $props();
</script>

<BottomSheet bind:isOpen>
  <div class="flex w-full flex-col py-4">
    <EntryButton onclick={onDirectoryCreate}>
      <div class="flex h-12 items-center justify-center gap-x-4">
        <IconCreateNewFolder class="text-2xl text-yellow-500" />
        <p class="font-medium">폴더 만들기</p>
      </div>
    </EntryButton>
    <EntryButton onclick={onFileUpload}>
      <div class="flex h-12 items-center justify-center gap-x-4">
        <IconUploadFile class="text-2xl text-blue-400" />
        <p class="font-medium">파일 업로드</p>
      </div>
    </EntryButton>
  </div>
</BottomSheet>
