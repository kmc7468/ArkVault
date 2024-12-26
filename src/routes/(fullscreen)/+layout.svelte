<script lang="ts">
  import { AdaptiveDiv } from "$lib/components/divs";

  let { children } = $props();
</script>

<div class="h-screen w-screen p-2">
  <AdaptiveDiv>
    {@render children?.()}
  </AdaptiveDiv>
</div>
