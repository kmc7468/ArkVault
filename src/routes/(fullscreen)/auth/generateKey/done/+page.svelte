<script lang="ts">
  import { Button, TextButton } from "$lib/components/buttons";
  import { BottomDiv } from "$lib/components/divs";

  import IconCheckCircle from "~icons/material-symbols/check-circle";
</script>

<svetle:head>
  <title>암호 키 생성하기</title>
</svetle:head>

<div class="flex h-full flex-col justify-between">
  <div class="mt-[40%] space-y-4">
    <IconCheckCircle class="mx-auto text-8xl text-primary-500" />
    <p class="text-center text-2xl font-bold text-primary-500">암호 키가 생성되었어요!</p>
    <div class="space-y-2 break-keep text-center text-gray-800">
      <p>모든 디바이스의 암호 키가 유실되면 서버에 저장된 데이터를 영원히 복호화할 수 없게 돼요.</p>
      <p>복원을 위해 암호 키를 파일로 내보낼 수 있어요.</p>
    </div>
  </div>
  <BottomDiv>
    <div class="w-full">
      <Button>암호 키 내보내기</Button>
    </div>
    <div class="w-fit">
      <TextButton>내보내지 않을래요</TextButton>
    </div>
  </BottomDiv>
</div>
