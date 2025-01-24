<script lang="ts">
  import { Button, Modal } from "$lib/components/atoms";

  interface Props {
    onContinueClick: () => void;
    isOpen: boolean;
  }

  let { onContinueClick, isOpen = $bindable() }: Props = $props();
</script>

<Modal bind:isOpen>
  <div class="space-y-4">
    <div class="space-y-2 break-keep">
      <p class="text-xl font-bold">내보내지 않고 계속할까요?</p>
      <p>암호 키 파일은 유출 방지를 위해 이 화면에서만 저장할 수 있어요.</p>
    </div>
    <div class="flex gap-x-2">
      <Button color="gray" onclick={() => (isOpen = false)} class="flex-1">아니요</Button>
      <Button onclick={onContinueClick} class="flex-1">계속할게요</Button>
    </div>
  </div>
</Modal>
