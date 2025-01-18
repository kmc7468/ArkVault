<script lang="ts">
  import { untrack } from "svelte";
  import { get, type Writable } from "svelte/store";
  import { fileUploadStatusStore, isFileUploading, type FileUploadStatus } from "$lib/stores";

  interface Props {
    onclick: () => void;
  }

  let { onclick }: Props = $props();

  let uploadingFiles: Writable<FileUploadStatus>[] = $state([]);

  $effect(() => {
    uploadingFiles = $fileUploadStatusStore.filter((status) => isFileUploading(get(status).status));
    return untrack(() => {
      const unsubscribes = uploadingFiles.map((uploadingFile) =>
        uploadingFile.subscribe(({ status }) => {
          if (!isFileUploading(status)) {
            uploadingFiles = uploadingFiles.filter((file) => file !== uploadingFile);
          }
        }),
      );
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    });
  });
</script>

{#if uploadingFiles.length > 0}
  <button
    onclick={() => setTimeout(onclick, 100)}
    class="mb-4 max-w-[50%] flex-1 rounded-xl bg-blue-100 p-3 active:bg-blue-200"
  >
    <div class="flex h-full w-full flex-col text-left transition active:scale-95">
      <p class="text-xs text-gray-800">진행 중인 업로드</p>
      <p class="font-medium text-blue-800">{uploadingFiles.length}개</p>
    </div>
  </button>
{/if}
