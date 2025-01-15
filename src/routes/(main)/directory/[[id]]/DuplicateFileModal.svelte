<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button } from "$lib/components/buttons";

  interface Props {
    onclose: () => void;
    onDuplicateClick: () => void;
    isOpen: boolean;
  }

  let { onclose, onDuplicateClick, isOpen = $bindable() }: Props = $props();
</script>

<Modal bind:isOpen {onclose}>
  <div class="space-y-4">
    <div class="space-y-2 break-keep">
      <p class="text-xl font-bold">이미 업로드된 파일이에요.</p>
      <p>그래도 업로드할까요?</p>
    </div>
    <div class="flex gap-2">
      <Button color="gray" onclick={onclose}>아니요</Button>
      <Button onclick={onDuplicateClick}>업로드할게요</Button>
    </div>
  </div>
</Modal>
