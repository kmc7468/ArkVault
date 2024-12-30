<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import "../app.css";
  import { prepareClientKeyStore } from "./services";

  let { children } = $props();

  onMount(() => {
    prepareClientKeyStore().then(async (ok) => {
      if (!ok && !["/auth", "/key"].some((path) => location.pathname.startsWith(path))) {
        await goto(
          "/key/generate?redirect=" + encodeURIComponent(location.pathname + location.search),
        );
      }
    });
  });
</script>

{@render children()}
