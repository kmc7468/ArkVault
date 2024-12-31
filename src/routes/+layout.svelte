<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import "../app.css";
  import { prepareClientKeyStore, prepareMasterKeyStore } from "./services";

  let { children } = $props();

  onMount(async () => {
    const redirect = async (url: string) => {
      const whitelist = ["/auth", "/key", "/client/pending"];
      if (!whitelist.some((path) => location.pathname.startsWith(path))) {
        await goto(`${url}?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      }
    };

    if (!(await prepareClientKeyStore())) {
      return await redirect("/key/generate");
    }
    if (!(await prepareMasterKeyStore())) {
      return await redirect("/client/pending");
    }
  });
</script>

{@render children()}
