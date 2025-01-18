<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { EntryButton } from "$lib/components/buttons";

  interface Props {
    children: Snippet;
    icon: Component<SvelteHTMLElements["svg"]>;
    iconColor: string;
    onclick: () => void;
  }

  let { children, icon: Icon, iconColor, onclick }: Props = $props();
</script>

<EntryButton {onclick}>
  <div class="flex items-center gap-x-4">
    <div class="rounded-lg bg-gray-200 p-1 {iconColor}">
      <Icon />
    </div>
    <p class="font-medium">
      {@render children?.()}
    </p>
  </div>
</EntryButton>
