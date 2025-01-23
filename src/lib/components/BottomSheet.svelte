<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { AdaptiveDiv } from "$lib/components/divs";

  interface Props {
    children: Snippet;
    onclose?: () => void;
    isOpen: boolean;
  }

  let { children, onclose, isOpen = $bindable() }: Props = $props();

  const closeBottomSheet = $derived(
    onclose ||
      (() => {
        isOpen = false;
      }),
  );
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div onclick={closeBottomSheet} class="fixed inset-0 z-10 flex items-end justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-50" transition:fade={{ duration: 100 }}></div>
    <div class="z-20 w-full">
      <AdaptiveDiv>
        <div
          onclick={(e) => e.stopPropagation()}
          class="flex max-h-[70vh] min-h-[30vh] overflow-y-auto rounded-t-2xl bg-white px-4"
          transition:fly={{ y: 100, duration: 200 }}
        >
          {@render children?.()}
        </div>
      </AdaptiveDiv>
    </div>
  </div>
{/if}
