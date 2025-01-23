<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button } from "$lib/components/buttons";
  import { TextInput } from "$lib/components/inputs";
  import type { SelectedCategory } from "$lib/molecules/Categories";

  interface Props {
    onRenameClick: (newName: string) => Promise<boolean>;
    isOpen: boolean;
    selectedCategory: SelectedCategory | undefined;
  }

  let { onRenameClick, isOpen = $bindable(), selectedCategory = $bindable() }: Props = $props();

  let name = $state("");

  const closeModal = () => {
    name = "";
    isOpen = false;
    selectedCategory = undefined;
  };

  const renameEntry = async () => {
    // TODO: Validation

    if (await onRenameClick(name)) {
      closeModal();
    }
  };

  $effect(() => {
    if (selectedCategory) {
      name = selectedCategory.name;
    }
  });
</script>

<Modal bind:isOpen onclose={closeModal}>
  <p class="text-xl font-bold">이름 바꾸기</p>
  <div class="mt-2 flex w-full">
    <TextInput bind:value={name} placeholder="이름" />
  </div>
  <div class="mt-7 flex gap-2">
    <Button color="gray" onclick={closeModal}>닫기</Button>
    <Button onclick={renameEntry}>바꾸기</Button>
  </div>
</Modal>
