<script lang="ts">
  let { children } = $props();
</script>

<div class="sticky bottom-0 flex w-full flex-col items-center gap-y-2 bg-white">
  {@render children?.()}
</div>
