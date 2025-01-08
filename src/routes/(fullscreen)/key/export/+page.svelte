<script lang="ts">
  import { saveAs } from "file-saver";
  import { goto } from "$app/navigation";
  import { Button, TextButton } from "$lib/components/buttons";
  import { TitleDiv, BottomDiv } from "$lib/components/divs";
  import { clientKeyStore } from "$lib/stores";
  import BeforeContinueBottomSheet from "./BeforeContinueBottomSheet.svelte";
  import BeforeContinueModal from "./BeforeContinueModal.svelte";
  import {
    exportClientKeys,
    requestClientRegistration,
    storeClientKeys,
    requestTokenUpgrade,
    requestInitialMasterKeyRegistration,
  } from "./service";

  import IconKey from "~icons/material-symbols/key";

  let { data } = $props();

  let isBeforeContinueModalOpen = $state(false);
  let isBeforeContinueBottomSheetOpen = $state(false);

  const exportKeyPair = () => {
    const clientKeysExported = exportClientKeys(
      data.encryptKeyBase64,
      data.decryptKeyBase64,
      data.signKeyBase64,
      data.verifyKeyBase64,
    );
    const clientKeysBlob = new Blob([JSON.stringify(clientKeysExported)], {
      type: "application/json",
    });
    saveAs(clientKeysBlob, "arkvault-clientkey.json");

    if (!isBeforeContinueBottomSheetOpen) {
      setTimeout(() => {
        isBeforeContinueBottomSheetOpen = true;
      }, 1000);
    }
  };

  const registerPubKey = async () => {
    if (!$clientKeyStore) {
      throw new Error("Failed to find key pair");
    }

    isBeforeContinueModalOpen = false;
    isBeforeContinueBottomSheetOpen = false;

    try {
      if (
        !(await requestClientRegistration(
          data.encryptKeyBase64,
          $clientKeyStore.decryptKey,
          data.verifyKeyBase64,
          $clientKeyStore.signKey,
        ))
      )
        throw new Error("Failed to register client");

      await storeClientKeys($clientKeyStore);

      if (
        !(await requestTokenUpgrade(
          data.encryptKeyBase64,
          $clientKeyStore.decryptKey,
          data.verifyKeyBase64,
          $clientKeyStore.signKey,
        ))
      )
        throw new Error("Failed to upgrade token");

      if (
        !(await requestInitialMasterKeyRegistration(data.masterKeyWrapped, $clientKeyStore.signKey))
      )
        throw new Error("Failed to register initial MEK");

      await goto("/client/pending?redirect=" + encodeURIComponent(data.redirectPath));
    } catch (e) {
      // TODO: Error handling
      throw e;
    }
  };
</script>

<svelte:head>
  <title>암호 키 생성하기</title>
</svelte:head>

<TitleDiv icon={IconKey}>
  <div class="space-y-4 break-keep">
    <p class="text-3xl font-bold">암호 키를 파일로 내보낼까요?</p>
    <div class="space-y-2 text-lg text-gray-800">
      <p>
        모든 디바이스의 암호 키가 유실되면, 서버에 저장된 데이터를 영원히 복호화할 수 없게 돼요.
      </p>
      <p>만약의 상황을 위해 암호 키를 파일로 내보낼 수 있어요.</p>
    </div>
  </div>
</TitleDiv>
<BottomDiv>
  <Button onclick={exportKeyPair}>암호 키 내보내기</Button>
  <TextButton
    onclick={() => {
      isBeforeContinueModalOpen = true;
    }}
  >
    내보내지 않을래요
  </TextButton>
</BottomDiv>

<BeforeContinueModal bind:isOpen={isBeforeContinueModalOpen} onContinueClick={registerPubKey} />
<BeforeContinueBottomSheet
  bind:isOpen={isBeforeContinueBottomSheetOpen}
  onRetryClick={exportKeyPair}
  onContinueClick={registerPubKey}
/>
