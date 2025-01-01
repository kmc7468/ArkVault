<script lang="ts">
  import { AdaptiveDiv } from "$lib/components/divs";

  let { children } = $props();
</script>

<div class="h-screen w-full">
  <AdaptiveDiv>
    <div class="flex flex-col justify-between px-2">
      {@render children()}
    </div>
  </AdaptiveDiv>
</div>
