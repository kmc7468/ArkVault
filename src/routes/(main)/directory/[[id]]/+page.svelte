<script module lang="ts">
  export interface SelectedDiretoryEntry {
    type: "directory" | "file";
    id: number;
    name: string;
  }
</script>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { FloatingButton } from "$lib/components/buttons";
  import { masterKeyStore } from "$lib/stores";
  import CreateBottomSheet from "./CreateBottomSheet.svelte";
  import CreateDirectoryModal from "./CreateDirectoryModal.svelte";
  import DeleteDirectoryEntryModal from "./DeleteDirectoryEntryModal.svelte";
  import DirectoryEntry from "./DirectoryEntry.svelte";
  import DirectoryEntryMenuBottomSheet from "./DirectoryEntryMenuBottomSheet.svelte";
  import RenameDirectoryEntryModal from "./RenameDirectoryEntryModal.svelte";
  import {
    decryptDirectroyMetadata,
    decryptFileMetadata,
    requestDirectroyCreation,
    requestFileUpload,
  } from "./service";

  import IconAdd from "~icons/material-symbols/add";

  let { data } = $props();

  let fileInput: HTMLInputElement | undefined = $state();
  let selectedEntry: SelectedDiretoryEntry | undefined = $state();

  let isCreateBottomSheetOpen = $state(false);
  let isCreateDirectoryModalOpen = $state(false);

  let isDirectoryEntryMenuBottomSheetOpen = $state(false);
  let isRenameDirectoryEntryModalOpen = $state(false);
  let isDeleteDirectoryEntryModalOpen = $state(false);

  // TODO: FIX ME
  const metadata = $derived.by(() => {
    const { metadata } = data;
    if (metadata && $masterKeyStore) {
      return decryptDirectroyMetadata(metadata, $masterKeyStore.get(metadata.mekVersion)!.key);
    }
  });
  const subDirectories = $derived.by(() => {
    const { subDirectories } = data;
    if ($masterKeyStore) {
      return Promise.all(
        subDirectories.map(async (subDirectory) => {
          const metadata = subDirectory.metadata!;
          return {
            ...(await decryptDirectroyMetadata(
              metadata,
              $masterKeyStore.get(metadata.mekVersion)!.key,
            )),
            id: subDirectory.id,
          };
        }),
      ).then((subDirectories) => {
        subDirectories.sort((a, b) => a.name.localeCompare(b.name));
        return subDirectories;
      });
    }
  });
  const files = $derived.by(() => {
    const { files } = data;
    if ($masterKeyStore) {
      return Promise.all(
        files.map(async (file) => ({
          ...(await decryptFileMetadata(file!, $masterKeyStore.get(file.mekVersion)!.key)),
          id: file.id,
        })),
      ).then((files) => {
        files.sort((a, b) => a.name.localeCompare(b.name));
        return files;
      });
    }
  });

  const createDirectory = async (name: string) => {
    await requestDirectroyCreation(name, data.id, $masterKeyStore?.get(1)!);
    isCreateDirectoryModalOpen = false;
  };

  const uploadFile = () => {
    const file = fileInput?.files?.[0];
    if (!file) return;

    requestFileUpload(file, data.id, $masterKeyStore?.get(1)!);
  };
</script>

<svelte:head>
  <title>파일</title>
</svelte:head>

<input bind:this={fileInput} onchange={uploadFile} type="file" class="hidden" />

<div class="px-4">
  {#if data.id !== "root"}
    {#if !metadata}
      <TopBar />
    {:else}
      {#await metadata}
        <TopBar />
      {:then metadata}
        <TopBar title={metadata.name} />
      {/await}
    {/if}
  {/if}
  <div class="my-4 pb-[4.5rem]">
    {#if subDirectories}
      {#await subDirectories then subDirectories}
        {#each subDirectories as { id, name }}
          <DirectoryEntry
            {name}
            onclick={() => goto(`/directory/${id}`)}
            onOpenMenuClick={() => {
              selectedEntry = { type: "directory", id, name };
              isDirectoryEntryMenuBottomSheetOpen = true;
            }}
            type="directory"
          />
        {/each}
      {/await}
    {/if}
    {#if files}
      {#await files then files}
        {#each files as { id, name }}
          <DirectoryEntry
            {name}
            onclick={() => goto(`/file/${id}`)}
            onOpenMenuClick={() => {
              selectedEntry = { type: "file", id, name };
              isDirectoryEntryMenuBottomSheetOpen = true;
            }}
            type="file"
          />
        {/each}
      {/await}
    {/if}
  </div>
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
<RenameDirectoryEntryModal bind:isOpen={isRenameDirectoryEntryModalOpen} bind:selectedEntry />
<DeleteDirectoryEntryModal bind:isOpen={isDeleteDirectoryEntryModalOpen} bind:selectedEntry />
