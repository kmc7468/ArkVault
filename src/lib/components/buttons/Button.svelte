<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    color?: "primary" | "gray";
    onclick?: () => void;
  }

  let { children, color = "primary", onclick }: Props = $props();

  const bgColorStyle = $derived(
    {
      primary: "bg-primary-600 active:bg-primary-500",
      gray: "bg-gray-300 active:bg-gray-400",
    }[color],
  );
  const fontColorStyle = $derived(
    {
      primary: "text-white",
      gray: "text-gray-800",
    }[color],
  );
</script>

<button
  onclick={() => {
    setTimeout(() => {
      onclick?.();
    }, 100);
  }}
  class="{bgColorStyle} {fontColorStyle} h-12 w-full rounded-xl font-medium"
>
  <div class="h-full w-full p-3 transition active:scale-95">
    {@render children?.()}
  </div>
</button>
