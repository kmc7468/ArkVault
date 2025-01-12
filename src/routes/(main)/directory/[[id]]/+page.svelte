<script lang="ts">
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { FloatingButton } from "$lib/components/buttons";
  import { getDirectoryInfo } from "$lib/modules/file";
  import { masterKeyStore, hmacSecretStore, type DirectoryInfo } from "$lib/stores";
  import CreateBottomSheet from "./CreateBottomSheet.svelte";
  import CreateDirectoryModal from "./CreateDirectoryModal.svelte";
  import DeleteDirectoryEntryModal from "./DeleteDirectoryEntryModal.svelte";
  import DirectoryEntries from "./DirectoryEntries";
  import DirectoryEntryMenuBottomSheet from "./DirectoryEntryMenuBottomSheet.svelte";
  import RenameDirectoryEntryModal from "./RenameDirectoryEntryModal.svelte";
  import {
    requestHmacSecretDownload,
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
    info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
  };

  const uploadFile = () => {
    const file = fileInput?.files?.[0];
    if (!file) return;

    requestFileUpload(file, data.id, $masterKeyStore?.get(1)!, $hmacSecretStore?.get(1)!).then(
      () => {
        info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
      },
    );
  };

  onMount(async () => {
    if (!$hmacSecretStore && !(await requestHmacSecretDownload($masterKeyStore?.get(1)?.key!))) {
      throw new Error("Failed to download hmac secrets");
    }
  });

  $effect(() => {
    info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!);
  });
</script>

<svelte:head>
  <title>파일</title>
</svelte:head>

<input bind:this={fileInput} onchange={uploadFile} type="file" class="hidden" />

<div class="flex min-h-full flex-col px-4">
  {#if data.id !== "root"}
    <TopBar title={$info?.name} />
  {/if}
  {#if $info}
    {@const topMargin = data.id === "root" ? "mt-4" : ""}
    <div class="mb-4 flex flex-grow flex-col {topMargin}">
      {#key $info}
        <DirectoryEntries
          info={$info}
          onEntryClick={({ type, id }) => goto(`/${type}/${id}`)}
          onEntryMenuClick={(entry) => {
            selectedEntry = entry;
            isDirectoryEntryMenuBottomSheetOpen = true;
          }}
        />
      {/key}
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
    info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
    return true;
  }}
/>
<DeleteDirectoryEntryModal
  bind:isOpen={isDeleteDirectoryEntryModalOpen}
  bind:selectedEntry
  onDeleteClick={async () => {
    await requestDirectoryEntryDeletion(selectedEntry!);
    info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
    return true;
  }}
/>
