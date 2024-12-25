<script lang="ts">
  interface Props {
    children?: any;
    color?: "primary" | "gray";
    onclick?: () => void;
  }

  let { children, color = "primary", onclick }: Props = $props();

  let bgColorStyle = $derived(
    {
      primary: "bg-primary-600 active:bg-primary-500",
      gray: "bg-gray-300 active:bg-gray-400",
    }[color],
  );
  let fontColorStyle = $derived(
    {
      primary: "text-white",
      gray: "text-gray-800",
    }[color],
  );
</script>

<button {onclick} class="{bgColorStyle} {fontColorStyle} h-12 h-full w-full rounded-xl font-medium">
  <div class="h-full w-full p-3 transition active:scale-95">
    {@render children?.()}
  </div>
</button>
