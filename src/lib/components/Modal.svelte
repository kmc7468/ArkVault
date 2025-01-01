<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { AdaptiveDiv } from "$lib/components/divs";

  interface Props {
    children: Snippet;
    isOpen: boolean;
  }

  let { children, isOpen = $bindable() }: Props = $props();
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onclick={() => {
      isOpen = false;
    }}
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-2"
    transition:fade={{ duration: 100 }}
  >
    <AdaptiveDiv>
      <div onclick={(e) => e.stopPropagation()} class="max-w-full rounded-2xl bg-white p-4">
        {@render children?.()}
      </div>
    </AdaptiveDiv>
  </div>
{/if}
