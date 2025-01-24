<script lang="ts">
  import { AdaptiveDiv } from "$lib/components/atoms";
  import BottomBar from "./BottomBar.svelte";

  let { children } = $props();
</script>

<div class="flex h-screen flex-col justify-between">
  <div class="flex-grow">
    <AdaptiveDiv class="h-full">
      {@render children()}
    </AdaptiveDiv>
  </div>
  <BottomBar />
</div>
