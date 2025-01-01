<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { AdaptiveDiv } from "$lib/components/divs";

  interface Props {
    children: Snippet;
    onClose?: () => void;
    isOpen: boolean;
  }

  let { children, onClose, isOpen = $bindable() }: Props = $props();

  const closeModal = $derived(
    onClose ||
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
    class="fixed inset-0 z-10 bg-black bg-opacity-50 px-2"
    transition:fade={{ duration: 100 }}
  >
    <AdaptiveDiv>
      <div class="flex h-full items-center justify-center">
        <div onclick={(e) => e.stopPropagation()} class="max-w-full rounded-2xl bg-white p-4">
          {@render children?.()}
        </div>
      </div>
    </AdaptiveDiv>
  </div>
{/if}
