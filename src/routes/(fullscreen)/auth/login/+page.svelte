<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Button, TextButton } from "$lib/components/buttons";
  import { TitleDiv, BottomDiv } from "$lib/components/divs";
  import { TextInput } from "$lib/components/inputs";
  import { refreshToken } from "$lib/hooks/callAPI";
  import { clientKeyStore } from "$lib/stores";
  import { requestLogin, requestTokenUpgrade } from "./service";

  let { data } = $props();

  let email = $state("");
  let password = $state("");

  const login = async () => {
    // TODO: Validation

    try {
      if (!(await requestLogin(email, password))) throw new Error("Failed to login");

      if ($clientKeyStore && !(await requestTokenUpgrade($clientKeyStore)))
        throw new Error("Failed to upgrade token");

      await goto(
        $clientKeyStore
          ? data.redirectPath
          : "/key/generate?redirect=" + encodeURIComponent(data.redirectPath),
      );
    } catch (e) {
      // TODO: Alert
      throw e;
    }
  };

  onMount(async () => {
    const res = await refreshToken();
    if (res.ok) {
      await goto(data.redirectPath);
    }
  });
</script>

<svelte:head>
  <title>로그인</title>
</svelte:head>

<div class="flex h-full flex-col justify-between">
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
</div>
