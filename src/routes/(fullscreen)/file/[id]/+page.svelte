<script lang="ts">
  import FileSaver from "file-saver";
  import heic2any from "heic2any";
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

  let content: Blob | undefined = $state();
  let contentUrl: string | undefined = $state();
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

        if ($info.contentType.startsWith("image")) {
          contentType = "image";
        } else if ($info.contentType.startsWith("video")) {
          contentType = "video";
        }

        requestFileDownload(data.id, $info.contentIv, $info.dataKey).then(async (res) => {
          content = new Blob([res], { type: $info.contentType });
          if (content.type === "image/heic" || content.type === "image/heif") {
            contentUrl = URL.createObjectURL(
              (await heic2any({ blob: content, toType: "image/jpeg" })) as Blob,
            );
          } else if (contentType) {
            contentUrl = URL.createObjectURL(content);
          } else {
            FileSaver.saveAs(content, $info.name);
          }
        });
      });
    }
  });

  $effect(() => {
    return () => {
      if (contentUrl) {
        URL.revokeObjectURL(contentUrl);
      }
    };
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

    {#if $info && contentType === "image"}
      {#if contentUrl}
        <img src={contentUrl} alt={$info.name} />
      {:else}
        {@render viewerLoading("이미지를 불러오고 있어요.")}
      {/if}
    {:else if contentType === "video"}
      {#if contentUrl}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video src={contentUrl} controls></video>
      {:else}
        {@render viewerLoading("비디오를 불러오고 있어요.")}
      {/if}
    {/if}
  </div>
</div>
