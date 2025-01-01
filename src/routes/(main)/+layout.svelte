<script lang="ts">
  import BottomBar from "./BottomBar.svelte";

  let { children } = $props();
</script>

<div class="flex h-full w-full flex-col justify-between">
  <div>
    {@render children?.()}
  </div>
  <BottomBar />
</div>
