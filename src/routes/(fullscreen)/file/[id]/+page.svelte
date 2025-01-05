<script lang="ts">
  import FileSaver from "file-saver";
  import { TopBar } from "$lib/components";
  import { masterKeyStore } from "$lib/stores";
  import { decryptFileMetadata, requestFileDownload } from "./service";

  let { data } = $props();

  let metadata = $state<Awaited<ReturnType<typeof decryptFileMetadata>> | undefined>();

  $effect(() => {
    if ($masterKeyStore) {
      decryptFileMetadata(data.metadata, $masterKeyStore.get(data.metadata.mekVersion)!.key).then(
        async (_metadata) => {
          metadata = _metadata;

          const file = await requestFileDownload(
            data.id,
            data.metadata.contentIv,
            _metadata.dataKey,
          );

          // TODO: Preview

          const blob = new Blob([file]);

          FileSaver.saveAs(blob, metadata.name);
        },
      );
    }
  });
</script>

<svelte:head>
  <title>파일</title>
</svelte:head>

{#if metadata}
  <TopBar title={metadata.name} />
{:else}
  <TopBar />
{/if}
