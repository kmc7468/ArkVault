<script lang="ts">
  let { children } = $props();
</script>

<div class="mx-auto w-full max-w-screen-md">
  {@render children?.()}
</div>
