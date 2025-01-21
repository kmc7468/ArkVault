<script lang="ts">
  import type { Writable } from "svelte/store";
  import { getFileInfo, type FileInfo, type CategoryInfo } from "$lib/modules/filesystem";
  import { masterKeyStore } from "$lib/stores";
  import File from "./File.svelte";
  import type { SelectedFile } from "./service";

  interface Props {
    info: CategoryInfo;
    onFileClick: (file: SelectedFile) => void;
  }

  let { info, onFileClick }: Props = $props();

  let files: Writable<FileInfo | null>[] = $state([]);

  $effect(() => {
    files =
      info.files?.map((id) => {
        const info = getFileInfo(id, $masterKeyStore?.get(1)?.key!);
        return info;
      }) ?? [];

    // TODO: Sorting
  });
</script>

<div class="space-y-1">
  {#each files as file}
    <File info={file} onclick={onFileClick} />
  {:else}
    <p class="text-gray-800">이 카테고리에 추가된 파일이 없어요.</p>
  {/each}
</div>
