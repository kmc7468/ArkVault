<script lang="ts">
  import { AdaptiveDiv } from "$lib/components/divs";

  let { children } = $props();
</script>

<div class="h-dvh w-full p-2">
  <AdaptiveDiv>
    {@render children()}
  </AdaptiveDiv>
</div>
