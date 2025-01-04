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

<div class="sticky top-0 flex items-center justify-between bg-white pt-4">
  <button onclick={back} class="w-[2.3rem] flex-shrink-0 rounded-full p-1 active:bg-gray-100">
    <IconArrowBack class="text-2xl" />
  </button>
  {#if title}
    <p class="flex-grow truncate px-2 text-center text-lg font-semibold">{title}</p>
  {/if}
  <div class="min-w-[2.3rem] flex-shrink-0">
    {#if children}
      {@render children?.()}
    {/if}
  </div>
</div>
