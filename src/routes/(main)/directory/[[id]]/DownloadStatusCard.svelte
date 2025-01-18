<script lang="ts">
  import { untrack } from "svelte";
  import { get, type Writable } from "svelte/store";
  import { fileDownloadStatusStore, isFileDownloading, type FileDownloadStatus } from "$lib/stores";

  interface Props {
    onclick: () => void;
  }

  let { onclick }: Props = $props();

  let downloadingFiles: Writable<FileDownloadStatus>[] = $state([]);

  $effect(() => {
    downloadingFiles = $fileDownloadStatusStore.filter((status) =>
      isFileDownloading(get(status).status),
    );
    return untrack(() => {
      const unsubscribes = downloadingFiles.map((downloadingFile) =>
        downloadingFile.subscribe(({ status }) => {
          if (!isFileDownloading(status)) {
            downloadingFiles = downloadingFiles.filter((file) => file !== downloadingFile);
          }
        }),
      );
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    });
  });
</script>

{#if downloadingFiles.length > 0}
  <button
    onclick={() => setTimeout(onclick, 100)}
    class="mb-4 max-w-[50%] flex-1 rounded-xl bg-green-100 p-3 active:bg-green-200"
  >
    <div class="flex h-full w-full flex-col text-left transition active:scale-95">
      <p class="text-xs text-gray-800">진행 중인 다운로드</p>
      <p class="font-medium text-green-800">{downloadingFiles.length}개</p>
    </div>
  </button>
{/if}
