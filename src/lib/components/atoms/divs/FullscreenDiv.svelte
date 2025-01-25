<script lang="ts">
  let { children } = $props();
</script>

<div class="flex flex-grow flex-col justify-between px-4">
  {@render children?.()}
</div>
