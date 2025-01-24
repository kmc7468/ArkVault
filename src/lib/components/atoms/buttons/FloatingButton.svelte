<script lang="ts">
  import type { Component } from "svelte";
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";
  import { AdaptiveDiv } from "$lib/components/divs";

  interface Props {
    icon: Component<SvelteHTMLElements["svg"]>;
    offset?: ClassValue;
    onclick?: () => void;
  }

  let { icon: Icon, offset = "bottom-20", onclick }: Props = $props();
</script>

<div class="pointer-events-none fixed inset-0">
  <div class={["absolute w-full", offset]}>
    <AdaptiveDiv>
      <div class="relative">
        <div class="absolute bottom-4 right-4">
          <button
            onclick={onclick && (() => setTimeout(onclick, 100))}
            class="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 shadow-lg transition active:scale-95 active:bg-gray-400"
          >
            <Icon class="text-xl" />
          </button>
        </div>
      </div>
    </AdaptiveDiv>
  </div>
</div>
