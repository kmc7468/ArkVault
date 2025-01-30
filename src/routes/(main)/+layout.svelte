<script lang="ts">
  import { AdaptiveDiv } from "$lib/components/atoms";
  import BottomBar from "./BottomBar.svelte";

  let { children } = $props();
</script>

<div class="flex h-screen flex-col justify-between">
  <AdaptiveDiv class="w-full flex-grow">
    {@render children()}
  </AdaptiveDiv>
  <BottomBar />
</div>
