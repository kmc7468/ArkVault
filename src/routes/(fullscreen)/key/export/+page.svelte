<script lang="ts">
  import { Button, TextButton } from "$lib/components/buttons";
  import { BottomDiv } from "$lib/components/divs";
  import BeforeContinueModal from "./BeforeContinueModal.svelte";
  import { requestPubKeyRegistration } from "./service";

  import IconKey from "~icons/material-symbols/key";

  let { data } = $props();

  let isBeforeContinueModalOpen = $state(false);

  const exportKeyPair = () => {
    // TODO
    console.log(data.pubKeyBase64);
    console.log(data.privKeyBase64);
  };

  const continueWithoutExport = async () => {
    isBeforeContinueModalOpen = false;

    const ok = await requestPubKeyRegistration(data.pubKeyBase64);
    if (!ok) {
      // TODO
      return;
    }

    // TODO
  };
</script>

<svetle:head>
  <title>암호 키 생성하기</title>
</svetle:head>

<div class="flex h-full flex-col">
  <div class="flex h-[10%] items-center">
    <IconKey class="text-5xl text-gray-600" />
  </div>
  <div class="flex flex-1 flex-col justify-between">
    <div class="space-y-4">
      <p class="break-keep text-3xl font-bold">암호 키를 파일로 내보낼까요?</p>
      <div class="space-y-2 break-keep text-lg text-gray-800">
        <p>
          모든 디바이스의 암호 키가 유실되면, 서버에 저장된 데이터를 영원히 복호화할 수 없게 돼요.
        </p>
        <p>만약의 상황을 위해 암호 키를 파일로 내보낼 수 있어요.</p>
      </div>
    </div>
    <BottomDiv>
      <div class="w-full">
        <Button onclick={exportKeyPair}>암호 키 내보내기</Button>
      </div>
      <div class="w-fit">
        <TextButton
          onclick={() => {
            isBeforeContinueModalOpen = true;
          }}
        >
          내보내지 않을래요
        </TextButton>
      </div>
    </BottomDiv>
  </div>
</div>

<BeforeContinueModal
  bind:isOpen={isBeforeContinueModalOpen}
  onContinueClick={continueWithoutExport}
/>
