<script lang="ts">
  import FileSaver from "file-saver";
  import { untrack } from "svelte";
  import { get, type Writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { EntryButton } from "$lib/components/buttons";
  import {
    getFileInfo,
    getCategoryInfo,
    type FileInfo,
    type CategoryInfo,
  } from "$lib/modules/filesystem";
  import Categories from "$lib/molecules/Categories";
  import { fileDownloadStatusStore, isFileDownloading, masterKeyStore } from "$lib/stores";
  import AddToCategoryBottomSheet from "./AddToCategoryBottomSheet.svelte";
  import DownloadStatus from "./DownloadStatus.svelte";
  import {
    requestFileRemovalFromCategory,
    requestFileDownload,
    requestFileAdditionToCategory,
  } from "./service";

  import IconClose from "~icons/material-symbols/close";
  import IconAddCircle from "~icons/material-symbols/add-circle";

  let { data } = $props();

  let info: Writable<FileInfo | null> | undefined = $state();
  let categories: Writable<CategoryInfo | null>[] = $state([]);

  let isAddToCategoryBottomSheetOpen = $state(false);

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

  const addToCategory = async (categoryId: number) => {
    await requestFileAdditionToCategory(data.id, categoryId);
    isAddToCategoryBottomSheetOpen = false;
    info = getFileInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
  };

  const removeFromCategory = async (categoryId: number) => {
    await requestFileRemovalFromCategory(data.id, categoryId);
    info = getFileInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
  };

  $effect(() => {
    info = getFileInfo(data.id, $masterKeyStore?.get(1)?.key!);
    isDownloadRequested = false;
    viewerType = undefined;
  });

  $effect(() => {
    categories =
      $info?.categoryIds.map((id) => getCategoryInfo(id, $masterKeyStore?.get(1)?.key!)) ?? [];

    // TODO: Sorting
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
  <div class="space-y-4 pb-4">
    <DownloadStatus status={downloadStatus} />
    {#if $info && viewerType}
      <div class="flex w-full justify-center">
        {#snippet viewerLoading(message: string)}
          <p class="text-gray-500">{message}</p>
        {/snippet}

        {#if viewerType === "image"}
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
    {/if}
    <div class="space-y-2">
      <p class="text-lg font-bold">카테고리</p>
      <div class="space-y-1">
        <Categories
          {categories}
          categoryMenuIcon={IconClose}
          onCategoryClick={({ id }) => goto(`/category/${id}`)}
          onCategoryMenuClick={({ id }) => removeFromCategory(id)}
        />
        <EntryButton onclick={() => (isAddToCategoryBottomSheetOpen = true)}>
          <div class="flex h-8 items-center gap-x-4">
            <IconAddCircle class="text-lg text-gray-600" />
            <p class="font-medium text-gray-700">카테고리에 추가하기</p>
          </div>
        </EntryButton>
      </div>
    </div>
  </div>
</div>

<AddToCategoryBottomSheet
  bind:isOpen={isAddToCategoryBottomSheetOpen}
  onAddToCategoryClick={addToCategory}
/>
