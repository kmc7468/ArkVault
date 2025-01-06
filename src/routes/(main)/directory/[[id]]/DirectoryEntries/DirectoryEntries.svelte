<script lang="ts">
  import { untrack } from "svelte";
  import type { Writable } from "svelte/store";
  import { getDirectoryInfo, getFileInfo } from "$lib/modules/file";
  import { masterKeyStore, type DirectoryInfo, type FileInfo } from "$lib/stores";
  import File from "./File.svelte";
  import SubDirectory from "./SubDirectory.svelte";
  import { SortBy, sortEntries } from "./service";
  import type { SelectedDirectoryEntry } from "../service";

  interface Props {
    info: DirectoryInfo;
    onEntryClick: (entry: SelectedDirectoryEntry) => void;
    onEntryMenuClick: (entry: SelectedDirectoryEntry) => void;
    sortBy?: SortBy;
  }

  let { info, onEntryClick, onEntryMenuClick, sortBy = SortBy.NAME_ASC }: Props = $props();

  let subDirectoryInfos: Writable<DirectoryInfo | null>[] = $state([]);
  let fileInfos: Writable<FileInfo | null>[] = $state([]);

  $effect(() => {
    // TODO: Fix duplicated requests

    subDirectoryInfos = info.subDirectoryIds.map((id) =>
      getDirectoryInfo(id, $masterKeyStore?.get(1)?.key!),
    );
    fileInfos = info.fileIds.map((id) => getFileInfo(id, $masterKeyStore?.get(1)?.key!));

    const sort = () => {
      sortEntries(subDirectoryInfos, sortBy);
      sortEntries(fileInfos, sortBy);
    };
    return untrack(() => {
      const unsubscribes = subDirectoryInfos
        .map((subDirectoryInfo) => subDirectoryInfo.subscribe(sort))
        .concat(fileInfos.map((fileInfo) => fileInfo.subscribe(sort)));
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    });
  });
</script>

{#if info.subDirectoryIds.length + info.fileIds.length > 0}
  <div class="my-4 pb-[4.5rem]">
    {#each subDirectoryInfos as subDirectory}
      <SubDirectory info={subDirectory} onclick={onEntryClick} onOpenMenuClick={onEntryMenuClick} />
    {/each}
    {#each fileInfos as file}
      <File info={file} onclick={onEntryClick} onOpenMenuClick={onEntryMenuClick} />
    {/each}
  </div>
{:else}
  <div class="my-4 flex flex-grow items-center justify-center">
    <p class="text-gray-500">폴더가 비어 있어요.</p>
  </div>
{/if}
