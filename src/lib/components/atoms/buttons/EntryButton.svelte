<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  import IconChevronRight from "~icons/material-symbols/chevron-right";

  interface Props {
    children: Snippet;
    class?: ClassValue;
    onclick?: () => void;
  }

  let { children, class: className, onclick }: Props = $props();
</script>

<button
  onclick={onclick && (() => setTimeout(onclick, 100))}
  class={["rounded-xl active:bg-gray-100", className]}
>
  <div class="flex h-full items-center gap-x-4 p-2 transition active:scale-95">
    <div class="flex-grow">
      {@render children()}
    </div>
    <IconChevronRight class="flex-shrink-0 text-xl text-gray-800" />
  </div>
</button>
