<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";

  interface Props {
    icon?: Component<SvelteHTMLElements["svg"]>;
    children: Snippet;
  }

  let { icon, children }: Props = $props();
</script>

<div>
  <div class="box-content flex min-h-[10vh] items-center pt-2">
    {#if icon}
      {@const Icon = icon}
      <Icon class="text-5xl text-gray-600" />
    {/if}
  </div>
  {@render children?.()}
</div>
