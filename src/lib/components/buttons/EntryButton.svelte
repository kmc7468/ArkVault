<script lang="ts">
  import type { Snippet } from "svelte";

  import IconChevronRight from "~icons/material-symbols/chevron-right";

  interface Props {
    children: Snippet;
    onclick?: () => void;
  }

  let { children, onclick }: Props = $props();
</script>

<button
  onclick={() => {
    setTimeout(() => {
      onclick?.();
    }, 100);
  }}
  class="w-full rounded-xl active:bg-gray-100"
>
  <div class="flex w-full items-stretch justify-between p-2 transition active:scale-95">
    <div>
      {@render children?.()}
    </div>
    <div class="flex items-center justify-center">
      <IconChevronRight class="text-xl text-gray-800" />
    </div>
  </div>
</button>
