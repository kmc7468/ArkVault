<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";
  import { TitleLabel } from "$lib/components/molecules";

  interface Props {
    children?: Snippet;
    childrenClass?: ClassValue;
    class?: ClassValue;
    description?: Snippet;
    icon?: Component<SvelteHTMLElements["svg"]>;
    title?: Snippet;
    titleClass?: ClassValue;
  }

  let { children, description, icon, title, ...props }: Props = $props();
</script>

<div class={["space-y-4 py-4", props.class]}>
  <div class="space-y-2 break-keep">
    <TitleLabel {icon} textClass={props.titleClass}>
      {@render title?.()}
    </TitleLabel>
    {#if description}
      <p>
        {@render description()}
      </p>
    {/if}
  </div>
  {#if children}
    <div class={props.childrenClass}>
      {@render children()}
    </div>
  {/if}
</div>
