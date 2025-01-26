<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";
  import { EntryButton } from "$lib/components/atoms";
  import { IconLabel } from "$lib/components/molecules";

  interface Props {
    children?: Snippet;
    class?: ClassValue;
    icon: Component<SvelteHTMLElements["svg"]>;
    iconClass?: ClassValue;
    onclick?: () => void;
    textClass?: ClassValue;
  }

  let { children, icon, onclick, ...props }: Props = $props();
</script>

<EntryButton {onclick} class={props.class}>
  <IconLabel {icon} class="h-full" iconClass={props.iconClass} textClass={props.textClass}>
    {@render children?.()}
  </IconLabel>
</EntryButton>
