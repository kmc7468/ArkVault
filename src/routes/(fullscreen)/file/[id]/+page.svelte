<script lang="ts">
  import FileSaver from "file-saver";
  import { untrack } from "svelte";
  import type { Writable } from "svelte/store";
  import { TopBar } from "$lib/components";
  import { getFileInfo } from "$lib/modules/file";
  import { masterKeyStore, type FileInfo } from "$lib/stores";
  import { requestFileDownload } from "./service";

  type ContentType = "image" | "video";

  let { data } = $props();

  let info: Writable<FileInfo | null> | undefined = $state();
  let isDownloaded = $state(false);

  let content: ArrayBuffer | undefined = $state();
  let contentType: ContentType | undefined = $state();

  $effect(() => {
    info = getFileInfo(data.id, $masterKeyStore?.get(1)?.key!);
    isDownloaded = false;

    content = undefined;
    contentType = undefined;
  });

  $effect(() => {
    if ($info && !isDownloaded) {
      untrack(() => {
        isDownloaded = true;

        if ($info.contentType.startsWith("image/")) {
          contentType = "image";
        } else if ($info.contentType.startsWith("video/")) {
          contentType = "video";
        }

        requestFileDownload(data.id, $info.contentIv, $info.dataKey).then((res) => {
          content = res;

          if (!contentType) {
            FileSaver.saveAs(new Blob([res], { type: $info.contentType }), $info.name);
          }
        });
      });
    }
  });
</script>

<svelte:head>
  <title>파일</title>
</svelte:head>

<div class="flex h-full flex-col">
  <div class="flex-shrink-0">
    <TopBar title={$info?.name} />
  </div>
  <div class="flex w-full flex-grow flex-col items-center py-4">
    {#snippet viewerLoading(message: string)}
      <div class="flex flex-grow items-center justify-center">
        <p class="text-gray-500">{message}</p>
      </div>
    {/snippet}

    {#if contentType === "image"}
      {#if $info && content}
        {@const src = URL.createObjectURL(new Blob([content], { type: $info.contentType }))}
        <img {src} alt={$info.name} />
      {:else}
        {@render viewerLoading("이미지를 불러오고 있어요.")}
      {/if}
    {:else if contentType === "video"}
      {#if $info && content}
        {@const src = URL.createObjectURL(new Blob([content], { type: $info.contentType }))}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video {src} controls></video>
      {:else}
        {@render viewerLoading("비디오를 불러오고 있어요.")}
      {/if}
    {/if}
  </div>
</div>
