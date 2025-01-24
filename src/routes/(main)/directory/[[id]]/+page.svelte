<script lang="ts">
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { FloatingButton } from "$lib/components/atoms";
  import { RenameModal } from "$lib/components/organisms";
  import { getDirectoryInfo, type DirectoryInfo } from "$lib/modules/filesystem";
  import { masterKeyStore, hmacSecretStore } from "$lib/stores";
  import CreateBottomSheet from "./CreateBottomSheet.svelte";
  import CreateDirectoryModal from "./CreateDirectoryModal.svelte";
  import DeleteDirectoryEntryModal from "./DeleteDirectoryEntryModal.svelte";
  import DirectoryEntries from "./DirectoryEntries";
  import DirectoryEntryMenuBottomSheet from "./DirectoryEntryMenuBottomSheet.svelte";
  import DownloadStatusCard from "./DownloadStatusCard.svelte";
  import DuplicateFileModal from "./DuplicateFileModal.svelte";
  import UploadStatusCard from "./UploadStatusCard.svelte";
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
  let resolveForDuplicateFileModal: ((res: boolean) => void) | undefined = $state();
  let duplicatedFile: File | undefined = $state();
  let selectedEntry: SelectedDirectoryEntry | undefined = $state();

  let isCreateBottomSheetOpen = $state(false);
  let isCreateDirectoryModalOpen = $state(false);
  let isDuplicateFileModalOpen = $state(false);

  let isDirectoryEntryMenuBottomSheetOpen = $state(false);
  let isDirectoryEntryRenameModalOpen = $state(false);
  let isDeleteDirectoryEntryModalOpen = $state(false);

  const createDirectory = async (name: string) => {
    await requestDirectoryCreation(name, data.id, $masterKeyStore?.get(1)!);
    isCreateDirectoryModalOpen = false;
    info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
  };

  const uploadFile = () => {
    const files = fileInput?.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      requestFileUpload(file, data.id, $hmacSecretStore?.get(1)!, $masterKeyStore?.get(1)!, () => {
        return new Promise((resolve) => {
          resolveForDuplicateFileModal = resolve;
          duplicatedFile = file;
          isDuplicateFileModalOpen = true;
        });
      })
        .then((res) => {
          if (!res) return;

          // TODO: FIXME
          info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!);
          window.alert(`'${file.name}' 파일이 업로드되었어요.`);
        })
        .catch((e: Error) => {
          // TODO: FIXME
          console.error(e);
          window.alert(`'${file.name}' 파일 업로드에 실패했어요.\n${e.message}`);
        });
    }

    fileInput!.value = "";
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

<input bind:this={fileInput} onchange={uploadFile} type="file" multiple class="hidden" />

<div class="flex min-h-full flex-col px-4">
  {#if data.id !== "root"}
    <TopBar title={$info?.name} />
  {/if}
  {#if $info}
    {@const topMargin = data.id === "root" ? "mt-4" : ""}
    <div class="mb-4 flex flex-grow flex-col {topMargin}">
      <div class="flex gap-x-2">
        <UploadStatusCard onclick={() => goto("/file/uploads")} />
        <DownloadStatusCard onclick={() => goto("/file/downloads")} />
      </div>
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
<DuplicateFileModal
  bind:isOpen={isDuplicateFileModalOpen}
  file={duplicatedFile}
  onclose={() => {
    resolveForDuplicateFileModal?.(false);
    resolveForDuplicateFileModal = undefined;
    duplicatedFile = undefined;
    isDuplicateFileModalOpen = false;
  }}
  onDuplicateClick={() => {
    resolveForDuplicateFileModal?.(true);
    resolveForDuplicateFileModal = undefined;
    duplicatedFile = undefined;
    isDuplicateFileModalOpen = false;
  }}
/>

<DirectoryEntryMenuBottomSheet
  bind:isOpen={isDirectoryEntryMenuBottomSheetOpen}
  bind:selectedEntry
  onRenameClick={() => {
    isDirectoryEntryMenuBottomSheetOpen = false;
    isDirectoryEntryRenameModalOpen = true;
  }}
  onDeleteClick={() => {
    isDirectoryEntryMenuBottomSheetOpen = false;
    isDeleteDirectoryEntryModalOpen = true;
  }}
/>
<RenameModal
  bind:isOpen={isDirectoryEntryRenameModalOpen}
  onbeforeclose={() => (selectedEntry = undefined)}
  originalName={selectedEntry?.name}
  onrename={async (newName: string) => {
    if (await requestDirectoryEntryRename(selectedEntry!, newName)) {
      info = getDirectoryInfo(data.id, $masterKeyStore?.get(1)?.key!); // TODO: FIXME
      return true;
    }
    return false;
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
