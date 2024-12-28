<script lang="ts">
  import { saveAs } from "file-saver";
  import { goto } from "$app/navigation";
  import { Button, TextButton } from "$lib/components/buttons";
  import { BottomDiv } from "$lib/components/divs";
  import { keyPairStore } from "$lib/stores";
  import BeforeContinueBottomSheet from "./BeforeContinueBottomSheet.svelte";
  import BeforeContinueModal from "./BeforeContinueModal.svelte";
  import {
    createBlobFromKeyPairBase64,
    requestPubKeyRegistration,
    requestTokenUpgrade,
    storeKeyPairPersistently,
  } from "./service";

  import IconKey from "~icons/material-symbols/key";

  let { data } = $props();

  let isBeforeContinueModalOpen = $state(false);
  let isBeforeContinueBottomSheetOpen = $state(false);

  const exportKeyPair = () => {
    const keyPairBlob = createBlobFromKeyPairBase64(data.pubKeyBase64, data.privKeyBase64);
    saveAs(keyPairBlob, "arkvalut-keypair.pem");

    if (!isBeforeContinueBottomSheetOpen) {
      setTimeout(() => {
        isBeforeContinueBottomSheetOpen = true;
      }, 1000);
    }
  };

  const registerPubKey = async () => {
    if (!$keyPairStore) {
      throw new Error("Failed to find key pair");
    }

    isBeforeContinueModalOpen = false;
    isBeforeContinueBottomSheetOpen = false;

    if (await requestPubKeyRegistration(data.pubKeyBase64, $keyPairStore.privateKey)) {
      await storeKeyPairPersistently($keyPairStore);

      if (await requestTokenUpgrade(data.pubKeyBase64)) {
        await goto(data.redirectPath);
      } else {
        // TODO: Error handling
      }
    } else {
      // TODO: Error handling
    }
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

<BeforeContinueModal bind:isOpen={isBeforeContinueModalOpen} onContinueClick={registerPubKey} />
<BeforeContinueBottomSheet
  bind:isOpen={isBeforeContinueBottomSheetOpen}
  onRetryClick={exportKeyPair}
  onContinueClick={registerPubKey}
/>
