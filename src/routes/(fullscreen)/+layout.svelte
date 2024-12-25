<script lang="ts">
  import { AdaptiveDiv } from "$lib/components";

  let { children } = $props();
</script>

<div class="h-screen w-screen p-2">
  <AdaptiveDiv>
    {@render children?.()}
  </AdaptiveDiv>
</div>
