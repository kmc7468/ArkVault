<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button } from "$lib/components/buttons";
  import { TextInput } from "$lib/components/inputs";

  interface Props {
    onCreateClick: (name: string) => void;
    isOpen: boolean;
  }

  let { onCreateClick, isOpen = $bindable() }: Props = $props();

  let name = $state("");

  const closeModal = () => {
    name = "";
    isOpen = false;
  };
</script>

<Modal bind:isOpen onclose={closeModal}>
  <div class="flex flex-col px-1">
    <p class="text-xl font-bold">새 폴더</p>
    <div class="my-4 flex w-full">
      <TextInput bind:value={name} placeholder="폴더 이름" />
    </div>
    <div class="mt-5 flex gap-2">
      <Button color="gray" onclick={closeModal}>닫기</Button>
      <Button onclick={() => onCreateClick(name)}>만들기</Button>
    </div>
  </div>
</Modal>
