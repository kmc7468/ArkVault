<script lang="ts">
  import { get } from "svelte/store";
  import { TopBar } from "$lib/components";
  import { fileDownloadStatusStore, isFileDownloading } from "$lib/stores";
  import File from "./File.svelte";

  const downloadingFiles = $derived(
    $fileDownloadStatusStore.filter((status) => isFileDownloading(get(status).status)),
  );

  $effect(() => () => {
    $fileDownloadStatusStore = $fileDownloadStatusStore.filter((status) =>
      isFileDownloading(get(status).status),
    );
  });
</script>

<svelte:head>
  <title>진행 중인 다운로드</title>
</svelte:head>

<div class="flex h-full flex-col">
  <TopBar />
  <div class="space-y-2">
    {#each downloadingFiles as status}
      <File {status} />
    {/each}
  </div>
</div>
