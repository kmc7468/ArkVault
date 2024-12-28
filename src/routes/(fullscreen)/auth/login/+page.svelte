<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button, TextButton } from "$lib/components/buttons";
  import { TitleDiv, BottomDiv } from "$lib/components/divs";
  import { TextInput } from "$lib/components/inputs";
  import { keyPairStore } from "$lib/stores";
  import { requestLogin } from "./service";

  let { data } = $props();

  let email = $state("");
  let password = $state("");

  const login = async () => {
    // TODO: Validation

    if (await requestLogin(email, password, $keyPairStore)) {
      await goto(
        $keyPairStore
          ? data.redirectPath
          : "/key/generate?redirect=" + encodeURIComponent(data.redirectPath),
      );
    } else {
      // TODO: Alert
    }
  };
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
