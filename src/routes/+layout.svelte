<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getKeyPairFromIndexedDB } from "$lib/indexedDB";
  import { keyPairStore } from "$lib/stores";
  import "../app.css";

  let { children } = $props();

  onMount(async () => {
    const { pubKey, privKey } = await getKeyPairFromIndexedDB();
    if (pubKey && privKey) {
      keyPairStore.set({ publicKey: pubKey, privateKey: privKey });
    } else if (!["/auth", "/key/generate"].some((path) => location.pathname.startsWith(path))) {
      await goto(
        "/key/generate?redirect=" + encodeURIComponent(location.pathname + location.search),
      );
    }
  });
</script>

{@render children()}
