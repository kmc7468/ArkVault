<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { IconLabel } from "$lib/components/molecules";

  import IconFolder from "~icons/material-symbols/folder";
  import IconDraft from "~icons/material-symbols/draft";

  interface Props {
    class?: ClassValue;
    name: string;
    subtext?: string;
    textClass?: ClassValue;
    type: "directory" | "file";
  }

  let { class: className, name, subtext, textClass: textClassName, type }: Props = $props();
</script>

{#snippet subtextSnippet()}
  {subtext}
{/snippet}

<IconLabel
  icon={type === "directory" ? IconFolder : IconDraft}
  iconClass={type === "file" ? "text-blue-400" : undefined}
  subtext={subtext ? subtextSnippet : undefined}
  class={className}
  textClass={textClassName}
>
  {name}
</IconLabel>
