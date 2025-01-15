<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { FileUploadStatus } from "$lib/stores";
  import { formatUploadProgress, formatUploadRate } from "./service";

  import IconDraft from "~icons/material-symbols/draft";

  interface Props {
    info: Writable<FileUploadStatus>;
  }

  let { info }: Props = $props();
</script>

{#if $info.status !== "uploaded" && $info.status !== "canceled" && $info.status !== "error"}
  <div class="flex h-14 items-center gap-x-4 p-2">
    <div class="flex-shrink-0 text-lg">
      <IconDraft class="text-gray-600" />
    </div>
    <div class="flex flex-grow flex-col overflow-hidden">
      <p title={$info.name} class="truncate font-medium text-gray-800">
        {$info.name}
      </p>
      <p class="text-xs text-gray-800">
        {#if $info.status === "encryption-pending"}
          준비 중
        {:else if $info.status === "encrypting"}
          암호화하는 중
        {:else if $info.status === "upload-pending"}
          업로드를 기다리는 중
        {:else if $info.status === "uploading"}
          전송됨 {formatUploadProgress($info.progress)} · {formatUploadRate($info.rate)}
        {/if}
      </p>
    </div>
  </div>
{/if}
