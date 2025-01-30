<script lang="ts">
  import { AdaptiveDiv } from "$lib/components/atoms";

  let { children } = $props();
</script>

<AdaptiveDiv class="flex min-h-screen flex-col">
  {@render children()}
</AdaptiveDiv>
