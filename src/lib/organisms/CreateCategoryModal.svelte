<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button, TextInput } from "$lib/components/atoms";

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
  <p class="text-xl font-bold">새 카테고리</p>
  <div class="mt-2 flex w-full">
    <TextInput bind:value={name} placeholder="카테고리 이름" />
  </div>
  <div class="mt-7 flex gap-x-2">
    <Button color="gray" onclick={closeModal} class="flex-1">닫기</Button>
    <Button onclick={() => onCreateClick(name)} class="flex-1">만들기</Button>
  </div>
</Modal>
