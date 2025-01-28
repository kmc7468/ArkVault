<script lang="ts">
  import { get } from "svelte/store";
  import { FullscreenDiv } from "$lib/components/atoms";
  import { TopBar } from "$lib/components/molecules";
  import { fileUploadStatusStore, isFileUploading } from "$lib/stores";
  import File from "./File.svelte";

  let uploadingFiles = $derived(
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

<TopBar />
<FullscreenDiv>
  <div class="space-y-2 pb-4">
    {#each uploadingFiles as status}
      <File {status} />
    {/each}
  </div>
</FullscreenDiv>
