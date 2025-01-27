<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { fade } from "svelte/transition";
  import { AdaptiveDiv } from "$lib/components/atoms";

  interface Props {
    children?: Snippet;
    class?: ClassValue;
    isOpen: boolean;
    onclose?: () => void;
  }

  let { children, class: className, isOpen = $bindable(), onclose }: Props = $props();
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onclick={onclose || (() => (isOpen = false))}
    class="fixed inset-0 z-10 bg-black bg-opacity-50"
    transition:fade|global={{ duration: 100 }}
  >
    <AdaptiveDiv class="h-full">
      <div class="flex h-full items-center justify-center px-4">
        <div onclick={(e) => e.stopPropagation()} class={["rounded-2xl bg-white p-4", className]}>
          {@render children?.()}
        </div>
      </div>
    </AdaptiveDiv>
  </div>
{/if}
