<script lang="ts">
  interface Props {
    order: number;
    isLast?: boolean;
    title: string;
    description?: string;
  }

  let { order, isLast = false, title, description }: Props = $props();
</script>

<div class="items-strech flex gap-x-3 {isLast ? 'mb-0' : 'mb-2'}">
  <div class="flex flex-col">
    <p
      class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-700"
    >
      {order}
    </p>
    {#if !isLast}
      <div class="mx-auto mt-2 w-0.5 flex-grow rounded-full bg-gray-300"></div>
    {/if}
  </div>
  <div>
    <p class="flex min-h-8 items-center break-keep text-lg font-medium">
      {title}
    </p>
    <p class="mb-5 mt-1 break-keep text-gray-600">
      {#if description}
        {description}
      {/if}
    </p>
  </div>
</div>
