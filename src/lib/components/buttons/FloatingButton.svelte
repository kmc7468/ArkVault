<script lang="ts">
  import type { Component } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";

  interface Props {
    icon: Component<SvelteHTMLElements["svg"]>;
    onclick?: () => void;
  }

  let { icon: Icon, onclick }: Props = $props();
</script>

<button
  onclick={() => {
    setTimeout(() => {
      onclick?.();
    }, 100);
  }}
  class="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 shadow-lg transition active:scale-95 active:bg-gray-400"
>
  <Icon class="text-xl" />
</button>
