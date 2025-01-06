<script lang="ts">
  import { Modal } from "$lib/components";
  import { Button } from "$lib/components/buttons";
  import type { SelectedDirectoryEntry } from "./service";

  interface Props {
    onDeleteClick: () => Promise<boolean>;
    isOpen: boolean;
    selectedEntry: SelectedDirectoryEntry | undefined;
  }

  let { onDeleteClick, isOpen = $bindable(), selectedEntry = $bindable() }: Props = $props();

  const closeModal = () => {
    isOpen = false;
    selectedEntry = undefined;
  };

  const deleteEntry = async () => {
    // TODO: Validation

    if (await onDeleteClick()) {
      closeModal();
    }
  };
</script>

<Modal bind:isOpen onclose={closeModal}>
  {#if selectedEntry}
    {@const { type, name } = selectedEntry}
    {@const nameShort = name.length > 20 ? `${name.slice(0, 20)}...` : name}
    <div class="space-y-4">
      <div class="space-y-2">
        <p class="break-keep text-xl font-bold">
          {#if type === "directory"}
            '{nameShort}' 폴더를 삭제할까요?
          {:else}
            '{nameShort}' 파일을 삭제할까요?
          {/if}
        </p>
        <p class="break-keep">
          {#if type === "directory"}
            삭제한 폴더는 복구할 수 없어요. <br />
            폴더 안의 모든 파일과 폴더도 함께 삭제돼요.
          {:else}
            삭제한 파일은 복구할 수 없어요.
          {/if}
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          color="gray"
          onclick={() => {
            isOpen = false;
          }}
        >
          아니요
        </Button>
        <Button onclick={deleteEntry}>삭제할게요</Button>
      </div>
    </div>
  {/if}
</Modal>
