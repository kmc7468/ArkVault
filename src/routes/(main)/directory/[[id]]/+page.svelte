<script lang="ts">
  import { FloatingButton } from "$lib/components/buttons";
  import { clientKeyStore, masterKeyStore } from "$lib/stores";
  import CreateBottomSheet from "./CreateBottomSheet.svelte";
  import CreateDirectoryModal from "./CreateDirectoryModal.svelte";
  import DirectoryEntry from "./DirectoryEntry.svelte";
  import { decryptDirectroyMetadata, requestDirectroyCreation } from "./service";

  import IconAdd from "~icons/material-symbols/add";

  let { data } = $props();

  let isCreateBottomSheetOpen = $state(false);
  let isCreateDirectoryModalOpen = $state(false);

  // TODO: FIX ME
  const metadata = $derived.by(() => {
    const { metadata } = data;
    if (metadata && $masterKeyStore) {
      return decryptDirectroyMetadata(metadata, $masterKeyStore.get(metadata.mekVersion)!.key);
    }
  });
  const subDirectoryMetadatas = $derived.by(() => {
    const { subDirectories } = data;
    if ($masterKeyStore) {
      return Promise.all(
        subDirectories.map(async (subDirectory) => {
          const metadata = subDirectory.metadata!;
          return await decryptDirectroyMetadata(
            metadata,
            $masterKeyStore.get(metadata.mekVersion)!.key,
          );
        }),
      );
    }
  });
  const entries = $derived.by(() => {
    if (subDirectoryMetadatas) {
      return subDirectoryMetadatas.then((subDirectroyMetadatas) => {
        subDirectroyMetadatas.sort((a, b) => a.name.localeCompare(b.name));
        return subDirectroyMetadatas;
      });
    }
  });

  const createDirectory = async (name: string) => {
    await requestDirectroyCreation(
      name,
      data.id,
      $masterKeyStore?.get(1)!,
      $clientKeyStore?.signKey!,
    );
    isCreateDirectoryModalOpen = false;
  };
</script>

<svelte:head>
  <title>파일</title>
</svelte:head>

<div class="relative h-full">
  <div>
    {#if entries}
      {#await entries then entries}
        {#each entries as { name }}
          <DirectoryEntry {name} />
        {/each}
      {/await}
    {/if}
  </div>

  <FloatingButton
    icon={IconAdd}
    onclick={() => {
      isCreateBottomSheetOpen = true;
    }}
  />
</div>

<CreateBottomSheet
  bind:isOpen={isCreateBottomSheetOpen}
  onDirectoryCreate={() => {
    isCreateBottomSheetOpen = false;
    isCreateDirectoryModalOpen = true;
  }}
  onFileUpload={() => {
    isCreateBottomSheetOpen = false;
    // TODO
  }}
/>
<CreateDirectoryModal bind:isOpen={isCreateDirectoryModalOpen} onCreateClick={createDirectory} />
