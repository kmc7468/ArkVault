<script lang="ts">
  import type { Snippet } from "svelte";

  import IconArrowBack from "~icons/material-symbols/arrow-back";

  interface Props {
    children?: Snippet;
    onback?: () => void;
    title?: string;
  }

  let { children, onback, title }: Props = $props();

  const back = $derived(() => {
    setTimeout(onback || (() => history.back()), 100);
  });
</script>

<div class="relative mt-4 flex items-center justify-between">
  <button onclick={back} class="rounded-full p-1 active:bg-gray-100">
    <IconArrowBack class="text-2xl" />
  </button>
  {#if title}
    <p class="absolute left-1/2 -translate-x-1/2 transform text-xl font-semibold">{title}</p>
  {/if}
  {#if children}
    {@render children?.()}
  {/if}
</div>
