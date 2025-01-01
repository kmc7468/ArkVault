<script lang="ts">
  import { AdaptiveDiv } from "$lib/components/divs";
  import BottomBar from "./BottomBar.svelte";

  let { children } = $props();
</script>

<div class="flex h-screen w-full flex-col justify-between">
  <AdaptiveDiv>
    {@render children()}
  </AdaptiveDiv>
  <BottomBar />
</div>
