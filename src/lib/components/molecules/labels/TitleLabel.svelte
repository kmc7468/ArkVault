<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";

  interface Props {
    children?: Snippet;
    class?: ClassValue;
    icon?: Component<SvelteHTMLElements["svg"]>;
    textClass?: ClassValue;
  }

  let { children, icon: Icon, ...props }: Props = $props();
</script>

<div class={props.class}>
  <div class="flex min-h-[10vh] items-center">
    {#if Icon}
      <Icon class="text-5xl text-gray-600" />
    {/if}
  </div>
  <p class={["text-3xl font-bold", props.textClass]}>
    {@render children?.()}
  </p>
</div>
