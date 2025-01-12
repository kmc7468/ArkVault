<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";

  interface Props {
    children: Snippet;
    icon?: Component<SvelteHTMLElements["svg"]>;
    topPadding?: boolean;
  }

  let { topPadding = true, children, icon: Icon }: Props = $props();
</script>

<div>
  <div class="box-content flex min-h-[10vh] items-center {topPadding ? 'pt-4' : ''}">
    {#if Icon}
      <Icon class="text-5xl text-gray-600" />
    {/if}
  </div>
  {@render children?.()}
</div>
