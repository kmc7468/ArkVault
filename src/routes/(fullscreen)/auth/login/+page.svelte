<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button, TextButton } from "$lib/components/buttons";
  import { TitleDiv, BottomDiv } from "$lib/components/divs";
  import { TextInput } from "$lib/components/inputs";
  import { clientKeyStore, masterKeyStore } from "$lib/stores";
  import { requestLogin, requestSessionUpgrade, requestMasterKeyDownload } from "./service";

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

      if (!(await requestSessionUpgrade($clientKeyStore)))
        throw new Error("Failed to upgrade session");

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
</script>

<svelte:head>
  <title>로그인</title>
</svelte:head>

<TitleDiv>
  <div class="space-y-2 break-keep">
    <p class="text-3xl font-bold">환영합니다!</p>
    <p>서비스를 이용하려면 로그인을 해야해요.</p>
  </div>
  <div class="my-4 flex flex-col gap-y-2">
    <TextInput bind:value={email} placeholder="이메일" />
    <TextInput bind:value={password} placeholder="비밀번호" type="password" />
  </div>
</TitleDiv>
<BottomDiv>
  <Button onclick={login}>로그인</Button>
  <TextButton>계정이 없어요</TextButton>
</BottomDiv>
