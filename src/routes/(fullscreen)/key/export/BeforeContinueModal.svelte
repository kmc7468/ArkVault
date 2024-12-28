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
  <div class="space-y-4 px-1">
    <div class="space-y-2">
      <p class="break-keep text-xl font-bold">내보내지 않고 계속할까요?</p>
      <p class="break-keep">
        보안상의 이유로 지금 시점 이후로는 암호 키를 파일로 내보낼 수 없어요.
      </p>
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
      <Button onclick={onContinueClick}>계속합니다</Button>
    </div>
  </div>
</Modal>
