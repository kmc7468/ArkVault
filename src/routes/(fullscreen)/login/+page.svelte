<script lang="ts">
  import { Button, TextButton } from "$lib/components/buttons";
  import { TextInput } from "$lib/components/inputs";
  import { requestLogin } from "./service";

  let email = $state("");
  let password = $state("");

  const login = async () => {
    // TODO: Validation

    const ok = await requestLogin(email, password);

    // TODO: Action
  };
</script>

<svelte:head>
  <title>로그인</title>
</svelte:head>

<div class="flex h-full flex-col justify-between">
  <div class="mt-[20%]">
    <div class="flex flex-col gap-y-2">
      <h1 class="text-3xl font-bold">환영합니다!</h1>
      <p>서비스를 이용하려면 로그인을 해야해요.</p>
    </div>
    <div class="mt-4 flex flex-col gap-y-2">
      <TextInput bind:value={email} placeholder="이메일" />
      <TextInput bind:value={password} placeholder="비밀번호" type="password" />
    </div>
  </div>
  <div class="sticky bottom-0 flex w-full flex-col items-center gap-y-2">
    <div class="w-full">
      <Button onclick={login}>로그인</Button>
    </div>
    <div class="w-fit">
      <TextButton>계정이 없어요</TextButton>
    </div>
  </div>
</div>
