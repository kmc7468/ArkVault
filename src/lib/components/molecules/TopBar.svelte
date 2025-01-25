<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  import IconArrowBack from "~icons/material-symbols/arrow-back";

  interface Props {
    children?: Snippet;
    class?: ClassValue;
    onBackClick?: () => void;
    title?: string;
  }

  let { children, onBackClick, title, ...props }: Props = $props();
</script>

<div
  class={[
    "sticky top-0 z-10 flex items-center justify-between gap-x-2 px-2 py-3 backdrop-blur-2xl",
    props.class,
  ]}
>
  <button
    onclick={onBackClick || (() => history.back())}
    class="w-[2.3rem] flex-shrink-0 rounded-full p-1 active:bg-black active:bg-opacity-[0.04]"
  >
    <IconArrowBack class="text-2xl" />
  </button>
  {#if title}
    <p class="flex-grow truncate text-center text-lg font-semibold">{title}</p>
  {/if}
  <div class="w-[2.3rem] flex-shrink-0">
    {#if children}
      {@render children?.()}
    {/if}
  </div>
</div>
