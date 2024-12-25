<script lang="ts">
  interface Props {
    children?: any;
    onclick?: () => void;
  }

  let { children, onclick }: Props = $props();
</script>

<button {onclick} class="font-medium text-gray-800 active:rounded-xl active:bg-gray-100">
  <div class="h-full w-full p-1 transition active:scale-95">
    {@render children?.()}
  </div>
</button>
