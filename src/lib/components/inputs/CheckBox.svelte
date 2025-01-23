<script lang="ts">
  import type { Snippet } from "svelte";

  import IconCheckCircle from "~icons/material-symbols/check-circle";
  import IconCheckCircleOutline from "~icons/material-symbols/check-circle-outline";

  interface Props {
    children: Snippet;
    checked?: boolean;
  }

  let { children, checked = $bindable(false) }: Props = $props();
</script>

<label class="flex items-center gap-x-1">
  <input bind:checked type="checkbox" class="hidden" />
  {@render children?.()}
  {#if checked}
    <IconCheckCircle class="text-primary-600" />
  {:else}
    <IconCheckCircleOutline class="text-gray-300" />
  {/if}
</label>
