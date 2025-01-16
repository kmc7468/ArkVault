<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { goto as svelteGoto } from "$app/navigation";
  import { fileUploadStatusStore, clientKeyStore, masterKeyStore } from "$lib/stores";
  import "../app.css";

  let { children } = $props();

  const checkFileUploadStatus = (e: BeforeUnloadEvent) => {
    if (
      $fileUploadStatusStore.some((statusStore) => {
        const status = get(statusStore);
        return (
          status.status === "encryption-pending" ||
          status.status === "encrypting" ||
          status.status === "upload-pending" ||
          status.status === "uploading"
        );
      })
    ) {
      e.preventDefault();
    }
  };

  onMount(async () => {
    const goto = async (url: string) => {
      const whitelist = ["/auth/login", "/key", "/client/pending"];
      if (!whitelist.some((path) => location.pathname.startsWith(path))) {
        await svelteGoto(
          `${url}?redirect=${encodeURIComponent(location.pathname + location.search)}`,
        );
      }
    };

    if (!$clientKeyStore) {
      await goto("/key/generate");
    } else if (!$masterKeyStore) {
      await goto("/client/pending");
    }
  });
</script>

<svelte:window onbeforeunload={checkFileUploadStatus} />

{@render children()}
