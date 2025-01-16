<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button } from "$lib/components/buttons";

  interface Props {
    file: File | undefined;
    onclose: () => void;
    onDuplicateClick: () => void;
    isOpen: boolean;
  }

  let { file, onclose, onDuplicateClick, isOpen = $bindable() }: Props = $props();
</script>

<Modal bind:isOpen {onclose}>
  {#if file}
    {@const { name } = file}
    {@const nameShort = name.length > 20 ? `${name.slice(0, 20)}...` : name}
    <div class="space-y-4">
      <div class="space-y-2 break-keep">
        <p class="text-xl font-bold">'{nameShort}' 파일이 있어요.</p>
        <p>예전에 이미 업로드된 파일이에요. 그래도 업로드할까요?</p>
      </div>
      <div class="flex gap-2">
        <Button color="gray" onclick={onclose}>아니요</Button>
        <Button onclick={onDuplicateClick}>업로드할게요</Button>
      </div>
    </div>
  {/if}
</Modal>
