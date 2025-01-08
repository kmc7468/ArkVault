<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { AdaptiveDiv } from "$lib/components/divs";

  interface Props {
    children: Snippet;
    onclose?: () => void;
    isOpen: boolean;
  }

  let { children, onclose, isOpen = $bindable() }: Props = $props();

  const closeModal = $derived(
    onclose ||
      (() => {
        isOpen = false;
      }),
  );
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onclick={closeModal}
    class="fixed inset-0 z-10 bg-black bg-opacity-50"
    transition:fade={{ duration: 100 }}
  >
    <AdaptiveDiv>
      <div class="flex h-full items-center justify-center px-4">
        <div onclick={(e) => e.stopPropagation()} class="rounded-2xl bg-white p-4">
          {@render children?.()}
        </div>
      </div>
    </AdaptiveDiv>
  </div>
{/if}
