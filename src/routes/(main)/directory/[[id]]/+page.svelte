<script lang="ts">
  import type { Writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { FloatingButton } from "$lib/components/buttons";
  import { getDirectoryInfo, getFileInfo } from "$lib/modules/file";
  import { masterKeyStore, type DirectoryInfo } from "$lib/stores";
  import CreateBottomSheet from "./CreateBottomSheet.svelte";
  import CreateDirectoryModal from "./CreateDirectoryModal.svelte";
  import DeleteDirectoryEntryModal from "./DeleteDirectoryEntryModal.svelte";
  import DirectoryEntryMenuBottomSheet from "./DirectoryEntryMenuBottomSheet.svelte";
  import File from "./File.svelte";
  import RenameDirectoryEntryModal from "./RenameDirectoryEntryModal.svelte";
  import SubDirectory from "./SubDirectory.svelte";
  import {
    requestDirectoryCreation,
    requestFileUpload,
    requestDirectoryEntryRename,
    requestDirectoryEntryDeletion,
    type SelectedDirectoryEntry,
  } from "./service";

  import IconAdd from "~icons/material-symbols/add";

  let { data } = $props();

  let info: Writable<DirectoryInfo | null> | undefined = $state();
  let fileInput: HTMLInputElement | undefined = $state();
  let selectedEntry: SelectedDirectoryEntry | undefined = $state();

  let isCreateBottomSheetOpen = $state(false);
  let isCreateDirectoryModalOpen = $state(false);

  let isDirectoryEntryMenuBottomSheetOpen = $state(false);
  let isRenameDirectoryEntryModalOpen = $state(false);
  let isDeleteDirectoryEntryModalOpen = $state(false);

  const createDirectory = async (name: string) => {
    await requestDirectoryCreation(name, data.id, $masterKeyStore?.get(1)!);
    isCreateDirectoryModalOpen = false;
  };

  const uploadFile = () => {
    const file = fileInput?.files?.[0];
    if (!file) return;

    requestFileUpload(file, data.id, $masterKeyStore?.get(1)!);
  };

  $effect(() => {
    info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!);
  });
</script>

<svelte:head>
  <title>파일</title>
</svelte:head>

<input bind:this={fileInput} onchange={uploadFile} type="file" class="hidden" />

<div class="flex min-h-full flex-col px-4">
  <div class="flex-shrink-0">
    {#if data.id !== "root"}
      <TopBar title={$info?.name} />
    {/if}
  </div>
  {#if $info && $info.subDirectoryIds.length + $info.fileIds.length > 0}
    <div class="my-4 pb-[4.5rem]">
      {#each $info.subDirectoryIds as subDirectoryId}
        {@const subDirectoryInfo = getDirectoryInfo(subDirectoryId, $masterKeyStore?.get(1)?.key!)}
        <SubDirectory
          info={subDirectoryInfo}
          onclick={() => goto(`/directory/${subDirectoryId}`)}
          onOpenMenuClick={({ id, dataKey, dataKeyVersion, name }) => {
            selectedEntry = { type: "directory", id, dataKey, dataKeyVersion, name };
            isDirectoryEntryMenuBottomSheetOpen = true;
          }}
        />
      {/each}
      {#each $info.fileIds as fileId}
        {@const fileInfo = getFileInfo(fileId, $masterKeyStore?.get(1)?.key!)}
        <File
          info={fileInfo}
          onclick={() => goto(`/file/${fileId}`)}
          onOpenMenuClick={({ dataKey, id, dataKeyVersion, name }) => {
            selectedEntry = { type: "file", id, dataKey, dataKeyVersion, name };
            isDirectoryEntryMenuBottomSheetOpen = true;
          }}
        />
      {/each}
    </div>
  {:else}
    <div class="my-4 flex flex-grow items-center justify-center">
      <p class="text-gray-500">폴더가 비어있어요.</p>
    </div>
  {/if}
</div>

<FloatingButton
  icon={IconAdd}
  onclick={() => {
    isCreateBottomSheetOpen = true;
  }}
/>

<CreateBottomSheet
  bind:isOpen={isCreateBottomSheetOpen}
  onDirectoryCreateClick={() => {
    isCreateBottomSheetOpen = false;
    isCreateDirectoryModalOpen = true;
  }}
  onFileUploadClick={() => {
    isCreateBottomSheetOpen = false;
    fileInput?.click();
  }}
/>
<CreateDirectoryModal bind:isOpen={isCreateDirectoryModalOpen} onCreateClick={createDirectory} />

<DirectoryEntryMenuBottomSheet
  bind:isOpen={isDirectoryEntryMenuBottomSheetOpen}
  bind:selectedEntry
  onRenameClick={() => {
    isDirectoryEntryMenuBottomSheetOpen = false;
    isRenameDirectoryEntryModalOpen = true;
  }}
  onDeleteClick={() => {
    isDirectoryEntryMenuBottomSheetOpen = false;
    isDeleteDirectoryEntryModalOpen = true;
  }}
/>
<RenameDirectoryEntryModal
  bind:isOpen={isRenameDirectoryEntryModalOpen}
  bind:selectedEntry
  onRenameClick={async (newName) => {
    await requestDirectoryEntryRename(selectedEntry!, newName);
    return true;
  }}
/>
<DeleteDirectoryEntryModal
  bind:isOpen={isDeleteDirectoryEntryModalOpen}
  bind:selectedEntry
  onDeleteClick={async () => {
    await requestDirectoryEntryDeletion(selectedEntry!);
    return true;
  }}
/>
