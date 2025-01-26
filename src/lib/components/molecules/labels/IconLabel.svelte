<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";

  interface Props {
    children?: Snippet;
    class?: ClassValue;
    icon: Component<SvelteHTMLElements["svg"]>;
    iconClass?: ClassValue;
    subtext?: Snippet;
    textClass?: ClassValue;
  }

  let { children, icon: Icon, subtext, ...props }: Props = $props();
</script>

<div class={["flex items-center gap-x-4", props.class]}>
  <div class={["flex-shrink-0 text-lg", props.iconClass]}>
    <Icon />
  </div>
  <div class="flex flex-grow flex-col gap-y-1 truncate text-left">
    <p class={["font-medium", props.textClass]}>
      {@render children?.()}
    </p>
    {#if subtext}
      <p class="text-xs text-gray-800">
        {@render subtext()}
      </p>
    {/if}
  </div>
</div>
