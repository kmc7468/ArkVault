<script lang="ts">
  import FileSaver from "file-saver";
  import { untrack } from "svelte";
  import { get, type Writable } from "svelte/store";
  import { TopBar } from "$lib/components";
  import { getFileInfo, type FileInfo } from "$lib/modules/filesystem";
  import { fileDownloadStatusStore, isFileDownloading, masterKeyStore } from "$lib/stores";
  import DownloadStatus from "./DownloadStatus.svelte";
  import { requestFileDownload } from "./service";

  let { data } = $props();

  let info: Writable<FileInfo | null> | undefined = $state();

  const downloadStatus = $derived(
    $fileDownloadStatusStore.find((statusStore) => {
      const { id, status } = get(statusStore);
      return id === data.id && isFileDownloading(status);
    }),
  );

  let isDownloadRequested = $state(false);
  let viewerType: "image" | "video" | undefined = $state();
  let fileBlobUrl: string | undefined = $state();

  const updateViewer = async (info: FileInfo, buffer: ArrayBuffer) => {
    const contentType = info.contentType;
    if (contentType.startsWith("image")) {
      viewerType = "image";
    } else if (contentType.startsWith("video")) {
      viewerType = "video";
    }

    const fileBlob = new Blob([buffer], { type: contentType });
    if (contentType === "image/heic") {
      const { default: heic2any } = await import("heic2any");
      fileBlobUrl = URL.createObjectURL(
        (await heic2any({ blob: fileBlob, toType: "image/jpeg" })) as Blob,
      );
    } else if (viewerType) {
      fileBlobUrl = URL.createObjectURL(fileBlob);
    }

    return fileBlob;
  };

  $effect(() => {
    info = getFileInfo(data.id, $masterKeyStore?.get(1)?.key!);
    isDownloadRequested = false;
    viewerType = undefined;
  });

  $effect(() => {
    if ($info && $info.dataKey && $info.contentIv) {
      untrack(() => {
        if (!downloadStatus && !isDownloadRequested) {
          isDownloadRequested = true;
          requestFileDownload(data.id, $info.contentIv!, $info.dataKey!).then(async (buffer) => {
            const blob = await updateViewer($info, buffer);
            if (!viewerType) {
              FileSaver.saveAs(blob, $info.name);
            }
          });
        }
      });
    }
  });

  $effect(() => {
    if ($info && $downloadStatus?.status === "decrypted") {
      untrack(() => !isDownloadRequested && updateViewer($info, $downloadStatus.result!));
    }
  });

  $effect(() => () => fileBlobUrl && URL.revokeObjectURL(fileBlobUrl));
</script>

<svelte:head>
  <title>파일</title>
</svelte:head>

<div class="flex h-full flex-col">
  <TopBar title={$info?.name} />
  <DownloadStatus status={downloadStatus} />
  <div class="flex w-full flex-grow flex-col items-center pb-4">
    {#snippet viewerLoading(message: string)}
      <div class="flex flex-grow items-center justify-center">
        <p class="text-gray-500">{message}</p>
      </div>
    {/snippet}

    {#if $info && viewerType === "image"}
      {#if fileBlobUrl}
        <img src={fileBlobUrl} alt={$info.name} />
      {:else}
        {@render viewerLoading("이미지를 불러오고 있어요.")}
      {/if}
    {:else if viewerType === "video"}
      {#if fileBlobUrl}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video src={fileBlobUrl} controls></video>
      {:else}
        {@render viewerLoading("비디오를 불러오고 있어요.")}
      {/if}
    {/if}
  </div>
</div>
