<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button } from "$lib/components/buttons";

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
    <div class="flex gap-2">
      <Button
        color="gray"
        onclick={() => {
          isOpen = false;
        }}
      >
        아니요
      </Button>
      <Button onclick={onContinueClick}>계속할게요</Button>
    </div>
  </div>
</Modal>
