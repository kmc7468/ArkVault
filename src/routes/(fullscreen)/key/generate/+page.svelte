<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Button, TextButton } from "$lib/components/buttons";
  import { TitleDiv, BottomDiv } from "$lib/components/divs";
  import { gotoStateful } from "$lib/hooks";
  import { clientKeyStore } from "$lib/stores";
  import Order from "./Order.svelte";
  import { generateClientKeys, generateInitialMasterKey } from "./service";

  import IconKey from "~icons/material-symbols/key";

  let { data } = $props();

  // TODO: Update
  const orders = [
    {
      title: "암호 키는 공개 키와 개인 키로 구성돼요.",
      description: "공개 키로 암호화된 데이터는 개인 키로만 복호화할 수 있어요.",
    },
    {
      title: "공개 키는 서버에 저장돼요.",
      description: "대신, 개인 키는 이 디바이스에만 저장돼요.",
    },
    {
      title: "다른 디바이스에서 공개 키를 이용해 데이터를 암호화하면,",
    },
    {
      title: "이 디바이스에서만 안전하게 복호화할 수 있어요.",
      description:
        "서버를 포함한 제3자는 데이터의 내용을 알 수 없어요. 개인 키가 이 디바이스에만 저장되기 때문이에요.",
    },
  ];

  const generate = async () => {
    // TODO: Loading indicator

    const { encryptKey, ...clientKeys } = await generateClientKeys();
    const { masterKeyWrapped } = await generateInitialMasterKey(encryptKey);

    await gotoStateful("/key/export", {
      ...clientKeys,
      redirectPath: data.redirectPath,
      masterKeyWrapped,
    });
  };

  onMount(async () => {
    if ($clientKeyStore) {
      await goto(data.redirectPath);
    }
  });
</script>

<svelte:head>
  <title>암호 키 생성하기</title>
</svelte:head>

<TitleDiv>
  <div class="flex flex-col gap-y-2">
    <h1 class="text-3xl font-bold">암호 키 생성하기</h1>
    <p>회원님의 디바이스 간의 안전한 데이터 동기화를 위해 암호 키를 생성해야 해요.</p>
  </div>
  <div class="my-4 flex flex-col gap-y-2">
    <div class="mb-4">
      <IconKey class="mx-auto text-7xl" />
      <p class="text-center text-xl font-bold text-primary-500">왜 암호 키가 필요한가요?</p>
    </div>
    <div>
      {#each orders as { title, description }, i}
        <Order order={i + 1} isLast={i === orders.length - 1} {title} {description} />
      {/each}
    </div>
  </div>
</TitleDiv>
<BottomDiv>
  <div class="w-full">
    <Button onclick={generate}>새 암호 키 생성하기</Button>
  </div>
  <div class="w-fit">
    <TextButton>키를 갖고 있어요</TextButton>
  </div>
</BottomDiv>
