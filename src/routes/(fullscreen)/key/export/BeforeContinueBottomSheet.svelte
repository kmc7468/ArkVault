<script lang="ts">
  import { BottomSheet } from "$lib/components";
  import { Button } from "$lib/components/buttons";
  import { BottomDiv } from "$lib/components/divs";

  interface Props {
    onRetryClick: () => void;
    onContinueClick: () => void;
    isOpen: boolean;
  }

  let { onRetryClick, onContinueClick, isOpen = $bindable() }: Props = $props();
</script>

<BottomSheet bind:isOpen>
  <div class="flex flex-col justify-between space-y-4">
    <div class="space-y-2">
      <p class="break-keep text-xl font-bold">암호 키 파일을 저장하셨나요?</p>
      <p class="break-keep">
        보안상의 이유로 지금 시점 이후로는 암호 키를 파일로 내보낼 수 없어요. 파일이 저장되었는지
        다시 확인해 주세요.
      </p>
    </div>
    <BottomDiv>
      <div class="flex w-full gap-2">
        <div class="w-full">
          <Button color="gray" onclick={onRetryClick}>다시 저장할래요</Button>
        </div>
        <div class="w-full">
          <Button onclick={onContinueClick}>잘 저장되었어요</Button>
        </div>
      </div>
    </BottomDiv>
  </div>
</BottomSheet>
