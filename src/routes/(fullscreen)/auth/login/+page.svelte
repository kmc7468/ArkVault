<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Button, TextButton } from "$lib/components/buttons";
  import { TitleDiv, BottomDiv } from "$lib/components/divs";
  import { TextInput } from "$lib/components/inputs";
  import { refreshToken } from "$lib/hooks/callApi";
  import { clientKeyStore, masterKeyStore } from "$lib/stores";
  import { requestLogin, requestTokenUpgrade, requestMasterKeyDownload } from "./service";

  let { data } = $props();

  let email = $state("");
  let password = $state("");

  const redirect = async (url: string) => {
    return await goto(`${url}?redirect=${encodeURIComponent(data.redirectPath)}`);
  };

  const login = async () => {
    // TODO: Validation

    try {
      if (!(await requestLogin(email, password))) throw new Error("Failed to login");

      if (!$clientKeyStore) return await redirect("/key/generate");

      if (!(await requestTokenUpgrade($clientKeyStore))) throw new Error("Failed to upgrade token");

      // TODO: Multi-user support

      if (
        $masterKeyStore ||
        (await requestMasterKeyDownload($clientKeyStore.decryptKey, $clientKeyStore.verifyKey))
      ) {
        await goto(data.redirectPath);
      } else {
        await redirect("/client/pending");
      }
    } catch (e) {
      // TODO: Alert
      throw e;
    }
  };

  onMount(async () => {
    const res = await refreshToken();
    if (res.ok) {
      await goto(data.redirectPath, { replaceState: true });
    }
  });
</script>

<svelte:head>
  <title>로그인</title>
</svelte:head>

<TitleDiv>
  <div class="flex flex-col gap-y-2">
    <h1 class="text-3xl font-bold">환영합니다!</h1>
    <p>서비스를 이용하려면 로그인을 해야해요.</p>
  </div>
  <div class="my-4 flex flex-col gap-y-2">
    <TextInput bind:value={email} placeholder="이메일" />
    <TextInput bind:value={password} placeholder="비밀번호" type="password" />
  </div>
</TitleDiv>
<BottomDiv>
  <div class="w-full">
    <Button onclick={login}>로그인</Button>
  </div>
  <div class="w-fit">
    <TextButton>계정이 없어요</TextButton>
  </div>
</BottomDiv>
