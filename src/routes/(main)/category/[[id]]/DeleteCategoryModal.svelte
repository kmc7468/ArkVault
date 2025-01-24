<script lang="ts">
  import { Button, Modal } from "$lib/components/atoms";
  import type { SelectedCategory } from "$lib/molecules/Categories";

  interface Props {
    onDeleteClick: () => Promise<boolean>;
    isOpen: boolean;
    selectedCategory: SelectedCategory | undefined;
  }

  let { onDeleteClick, isOpen = $bindable(), selectedCategory = $bindable() }: Props = $props();

  const closeModal = () => {
    isOpen = false;
    selectedCategory = undefined;
  };

  const deleteEntry = async () => {
    // TODO: Validation

    if (await onDeleteClick()) {
      closeModal();
    }
  };
</script>

<Modal bind:isOpen onclose={closeModal}>
  {#if selectedCategory}
    {@const { name } = selectedCategory}
    {@const nameShort = name.length > 20 ? `${name.slice(0, 20)}...` : name}
    <div class="space-y-4">
      <div class="space-y-2 break-keep">
        <p class="text-xl font-bold">
          '{nameShort}' 카테고리를 삭제할까요?
        </p>
        <p>
          모든 하위 카테고리도 함께 삭제돼요. <br />
          하지만 카테고리에 추가된 파일들은 삭제되지 않아요.
        </p>
      </div>
      <div class="flex gap-x-2">
        <Button color="gray" onclick={closeModal} class="flex-1">아니요</Button>
        <Button onclick={deleteEntry} class="flex-1">삭제할게요</Button>
      </div>
    </div>
  {/if}
</Modal>
