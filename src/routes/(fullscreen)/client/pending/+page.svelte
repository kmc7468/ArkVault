<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { FullscreenDiv } from "$lib/components/atoms";
  import { TitleDiv } from "$lib/components/divs";
  import { clientKeyStore, masterKeyStore } from "$lib/stores";
  import { generatePublicKeyFingerprint, requestMasterKeyDownload } from "./service";

  import IconFingerprint from "~icons/material-symbols/fingerprint";

  let { data } = $props();

  const fingerprint = $derived(
    $clientKeyStore
      ? generatePublicKeyFingerprint($clientKeyStore.encryptKey, $clientKeyStore.verifyKey)
      : undefined,
  );

  onMount(async () => {
    if (
      $masterKeyStore ||
      ($clientKeyStore &&
        (await requestMasterKeyDownload($clientKeyStore.decryptKey, $clientKeyStore.verifyKey)))
    ) {
      await goto(data.redirectPath, { replaceState: true });
    }
  });
</script>

<svelte:head>
  <title>승인을 기다리고 있어요.</title>
</svelte:head>

<FullscreenDiv>
  <TitleDiv>
    <div class="space-y-2 break-keep">
      <p class="text-3xl font-bold">승인을 기다리고 있어요.</p>
      <p>
        회원님의 다른 디바이스에서 이 디바이스의 데이터 접근을 승인해야 서비스를 이용할 수 있어요.
      </p>
    </div>
    <div class="my-4 space-y-4">
      <div>
        <IconFingerprint class="mx-auto text-7xl" />
        <p class="text-center text-xl font-bold text-primary-500">암호 키 지문</p>
      </div>
      <p class="rounded-2xl bg-gray-100 p-4 text-center text-2xl font-medium text-gray-800">
        {#if !fingerprint}
          지문 생성하는 중...
        {:else}
          {#await fingerprint}
            지문 생성하는 중...
          {:then fingerprint}
            {fingerprint}
          {/await}
        {/if}
      </p>
      <p class="text-center">
        암호 키 지문은 디바이스마다 다르게 생성돼요. <br />
        지문이 일치하는지 확인 후 승인해 주세요.
      </p>
    </div>
  </TitleDiv>
</FullscreenDiv>
