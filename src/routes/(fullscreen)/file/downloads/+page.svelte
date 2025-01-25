<script lang="ts">
  import { get } from "svelte/store";
  import { FullscreenDiv } from "$lib/components/atoms";
  import { TopBar } from "$lib/components/molecules";
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

<TopBar />
<FullscreenDiv>
  <div class="space-y-2 pb-4">
    {#each downloadingFiles as status}
      <File {status} />
    {/each}
  </div>
</FullscreenDiv>
