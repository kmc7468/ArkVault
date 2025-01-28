<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { fade, fly } from "svelte/transition";
  import { AdaptiveDiv } from "$lib/components/atoms";

  interface Props {
    children: Snippet;
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
    class="fixed inset-0 z-10 flex items-end justify-center"
  >
    <div
      class="absolute inset-0 bg-black bg-opacity-50"
      transition:fade|global={{ duration: 100 }}
    ></div>
    <div class="z-20 w-full">
      <AdaptiveDiv>
        <div
          onclick={(e) => e.stopPropagation()}
          class="flex max-h-[70vh] min-h-[30vh] flex-col rounded-t-2xl bg-white"
          transition:fly|global={{ y: 100, duration: 200 }}
        >
          <div class={["flex-grow overflow-y-auto", className]}>
            {@render children()}
          </div>
        </div>
      </AdaptiveDiv>
    </div>
  </div>
{/if}
