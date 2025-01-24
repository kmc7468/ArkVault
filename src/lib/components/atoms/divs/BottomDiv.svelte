<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    children?: Snippet;
    class?: ClassValue;
  }

  let { children, ...props }: Props = $props();
</script>

<div class={["sticky bottom-0 bg-white pb-4", props.class]}>
  {@render children?.()}
</div>
