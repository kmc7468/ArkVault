<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    children?: Snippet;
    class?: ClassValue;
    color?: "primary" | "gray";
    onclick?: () => void;
  }

  let { children, color = "primary", onclick, ...props }: Props = $props();

  let bgColor = $derived(
    {
      primary: "bg-primary-600 active:bg-primary-500",
      gray: "bg-gray-300 active:bg-gray-400",
    }[color],
  );
  let textColor = $derived(
    {
      primary: "text-white",
      gray: "text-gray-800",
    }[color],
  );
</script>

<button
  onclick={onclick && (() => setTimeout(onclick, 100))}
  class={["h-12 min-w-fit rounded-xl font-medium", bgColor, textColor, props.class]}
>
  <div class="h-full p-3 transition active:scale-95">
    {@render children?.()}
  </div>
</button>
