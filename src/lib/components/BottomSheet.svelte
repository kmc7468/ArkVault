<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, fly } from "svelte/transition";
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
    class="fixed inset-0 z-10 flex items-end justify-center"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50" transition:fade={{ duration: 100 }}></div>
    <div class="z-20 w-full">
      <AdaptiveDiv>
        <div
          onclick={(e) => e.stopPropagation()}
          class="flex max-h-[70vh] min-h-[30vh] w-full items-stretch rounded-t-2xl bg-white p-4"
          transition:fly={{ y: 100, duration: 200 }}
        >
          {@render children?.()}
        </div>
      </AdaptiveDiv>
    </div>
  </div>
{/if}
