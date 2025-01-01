<script lang="ts">
  interface Props {
    name: string;
  }

  let { name }: Props = $props();
</script>

<div>
  <!-- TODO -->
  <p>{name}</p>
</div>
