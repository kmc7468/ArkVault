<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { IconLabel } from "$lib/components/molecules";

  import IconCategory from "~icons/material-symbols/category";

  interface Props {
    class?: ClassValue;
    name: string;
    subtext?: string;
    textClass?: ClassValue;
  }

  let { name, subtext, ...props }: Props = $props();
</script>

{#snippet subtextSnippet()}
  {subtext}
{/snippet}

<IconLabel
  icon={IconCategory}
  subtext={subtext ? subtextSnippet : undefined}
  class={props.class}
  textClass={props.textClass}
>
  {name}
</IconLabel>
