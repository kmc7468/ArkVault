<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";

  interface Props {
    children: Snippet;
    isOpen: boolean;
  }

  let { children, isOpen = $bindable() }: Props = $props();

  const closeModal = () => {
    isOpen = false;
  };
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onclick={closeModal}
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-2"
  >
    <div
      onclick={(e) => e.stopPropagation()}
      class="max-w-full rounded-2xl bg-white p-4"
      transition:fade={{ duration: 100 }}
    >
      {@render children?.()}
    </div>
  </div>
{/if}
