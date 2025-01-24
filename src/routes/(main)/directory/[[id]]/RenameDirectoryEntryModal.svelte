<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button, TextInput } from "$lib/components/atoms";
  import type { SelectedDirectoryEntry } from "./service";

  interface Props {
    onRenameClick: (newName: string) => Promise<boolean>;
    isOpen: boolean;
    selectedEntry: SelectedDirectoryEntry | undefined;
  }

  let { onRenameClick, isOpen = $bindable(), selectedEntry = $bindable() }: Props = $props();

  let name = $state("");

  const closeModal = () => {
    name = "";
    isOpen = false;
    selectedEntry = undefined;
  };

  const renameEntry = async () => {
    // TODO: Validation

    if (await onRenameClick(name)) {
      closeModal();
    }
  };

  $effect(() => {
    if (selectedEntry) {
      name = selectedEntry.name;
    }
  });
</script>

<Modal bind:isOpen onclose={closeModal}>
  <p class="text-xl font-bold">이름 바꾸기</p>
  <div class="mt-2 flex w-full">
    <TextInput bind:value={name} placeholder="이름" />
  </div>
  <div class="mt-7 flex gap-x-2">
    <Button color="gray" onclick={closeModal} class="flex-1">닫기</Button>
    <Button onclick={renameEntry} class="flex-1">바꾸기</Button>
  </div>
</Modal>
