<script lang="ts">
  import FileSaver from "file-saver";
  import type { Writable } from "svelte/store";
  import { TopBar } from "$lib/components";
  import { getFileInfo } from "$lib/modules/file";
  import { masterKeyStore, type FileInfo } from "$lib/stores";
  import { requestFileDownload } from "./service";

  let { data } = $props();

  let info: Writable<FileInfo | null> | undefined = $state();
  let isDownloaded = $state(false);

  $effect(() => {
    info = getFileInfo(data.id, $masterKeyStore?.get(1)?.key!);
    isDownloaded = false;
  });

  $effect(() => {
    if (info && $info && !isDownloaded) {
      isDownloaded = true;
      requestFileDownload(data.id, $info.contentIv, $info.dataKey).then((content) => {
        FileSaver.saveAs(new Blob([content], { type: "application/octet-stream" }), $info.name);
      });
    }
  });
</script>

<svelte:head>
  <title>파일</title>
</svelte:head>

<TopBar title={$info?.name} />
