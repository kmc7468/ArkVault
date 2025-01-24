<script lang="ts">
  import { goto } from "$app/navigation";
  import { TopBar } from "$lib/components";
  import { Button, BottomDiv, TextInput } from "$lib/components/atoms";
  import { TitleDiv } from "$lib/components/divs";
  import { requestPasswordChange } from "./service";

  let oldPassword = $state("");
  let newPassword = $state("");

  const changePassword = async () => {
    if (await requestPasswordChange(oldPassword, newPassword)) {
      await goto("/menu");
    }
  };
</script>

<svelte:head>
  <title>비밀번호 바꾸기</title>
</svelte:head>

<div>
  <TopBar />
  <TitleDiv topPadding={false}>
    <div class="space-y-2 break-keep">
      <p class="text-2xl font-bold">기존 비밀번호와 새 비밀번호를 입력해 주세요.</p>
      <p>새 비밀번호는 8자 이상이어야 해요. 다른 사람들이 알 수 없도록 안전하게 설정해 주세요.</p>
    </div>
    <div class="my-4 flex flex-col gap-y-2">
      <TextInput bind:value={oldPassword} placeholder="기존 비밀번호" type="password" />
      <TextInput bind:value={newPassword} placeholder="새 비밀번호" type="password" />
    </div>
  </TitleDiv>
</div>
<BottomDiv>
  <Button onclick={changePassword} class="w-full">비밀번호 바꾸기</Button>
</BottomDiv>
