<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button } from "$lib/components/buttons";
  import { TextInput } from "$lib/components/inputs";
  import type { SelectedDiretoryEntry } from "./+page.svelte";

  interface Props {
    isOpen: boolean;
    selectedEntry: SelectedDiretoryEntry | undefined;
  }

  let { isOpen = $bindable(), selectedEntry = $bindable() }: Props = $props();

  let name = $state("");

  const closeModal = () => {
    name = "";
    isOpen = false;
    selectedEntry = undefined;
  };

  const renameEntry = () => {
    // TODO

    closeModal();
  };

  $effect(() => {
    if (selectedEntry) {
      name = selectedEntry.name;
    }
  });
</script>

<Modal bind:isOpen onclose={closeModal}>
  <div class="flex flex-col px-1">
    <p class="text-xl font-bold">이름 바꾸기</p>
    <div class="my-4 flex w-full">
      <TextInput bind:value={name} placeholder="이름" />
    </div>
    <div class="mt-5 flex gap-2">
      <Button color="gray" onclick={closeModal}>닫기</Button>
      <Button onclick={renameEntry}>바꾸기</Button>
    </div>
  </div>
</Modal>
