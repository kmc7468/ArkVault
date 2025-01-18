<script lang="ts">
  import { get } from "svelte/store";
  import { TopBar } from "$lib/components";
  import { fileUploadStatusStore, isFileUploading } from "$lib/stores";
  import File from "./File.svelte";

  const uploadingFiles = $derived(
    $fileUploadStatusStore.filter((status) => isFileUploading(get(status).status)),
  );

  $effect(() => () => {
    $fileUploadStatusStore = $fileUploadStatusStore.filter((status) =>
      isFileUploading(get(status).status),
    );
  });
</script>

<svelte:head>
  <title>진행 중인 업로드</title>
</svelte:head>

<div class="flex h-full flex-col">
  <TopBar />
  <div class="space-y-2">
    {#each uploadingFiles as status}
      <File {status} />
    {/each}
  </div>
</div>
