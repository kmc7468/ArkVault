<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { FileDownloadStatus } from "$lib/stores";
  import { formatDownloadProgress, formatDownloadRate } from "./service";

  interface Props {
    info?: Writable<FileDownloadStatus>;
  }

  let { info }: Props = $props();
</script>

{#if $info && $info.status !== "decrypted" && $info.status !== "canceled" && $info.status !== "error"}
  <div class="flex w-full flex-col rounded-xl bg-gray-100 p-3">
    <p class="font-medium">
      {#if $info.status === "download-pending"}
        다운로드를 기다리는 중
      {:else if $info.status === "downloading"}
        다운로드하는 중
      {:else if $info.status === "decryption-pending"}
        복호화를 기다리는 중
      {:else if $info.status === "decrypting"}
        복호화하는 중
      {/if}
    </p>
    <p class="text-xs">
      {#if $info.status === "downloading"}
        전송됨 {formatDownloadProgress($info.progress)} · {formatDownloadRate($info.rate)}
      {/if}
    </p>
  </div>
{/if}
