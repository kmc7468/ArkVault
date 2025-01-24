<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    children?: Snippet;
    class?: ClassValue;
  }

  let { children, ...props }: Props = $props();
</script>

<div class={["mx-auto w-full max-w-screen-md", props.class]}>
  {@render children?.()}
</div>
