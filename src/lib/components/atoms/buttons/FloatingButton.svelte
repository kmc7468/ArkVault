<script lang="ts">
  import type { Component } from "svelte";
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";
  import { AdaptiveDiv } from "$lib/components/atoms";

  interface Props {
    class: ClassValue;
    icon: Component<SvelteHTMLElements["svg"]>;
    onclick?: () => void;
  }

  let { class: className, icon: Icon, onclick }: Props = $props();
</script>

<div class="pointer-events-none fixed inset-0">
  <AdaptiveDiv class="relative h-full">
    <button
      onclick={onclick && (() => setTimeout(onclick, 100))}
      class={[
        "pointer-events-auto absolute flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 text-xl shadow-lg transition active:scale-95 active:bg-gray-400",
        className,
      ]}
    >
      <Icon />
    </button>
  </AdaptiveDiv>
</div>
