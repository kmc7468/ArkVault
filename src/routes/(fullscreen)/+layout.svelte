<script lang="ts">
  import { AdaptiveDiv } from "$lib/components/divs";

  let { children } = $props();
</script>

<AdaptiveDiv>
  <div class="flex h-screen flex-col justify-between px-4">
    {@render children()}
  </div>
</AdaptiveDiv>
