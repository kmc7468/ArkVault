<script module lang="ts">
  export type ConfirmHandler = () => void | Promise<void> | boolean | Promise<boolean>;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { Button, Modal } from "$lib/components/atoms";

  interface Props {
    cancelText?: string;
    children?: Snippet;
    confirmText: string;
    isOpen: boolean;
    onbeforeclose?: () => void;
    onconfirm: ConfirmHandler;
    title: string;
  }

  let {
    cancelText = "닫기",
    children,
    confirmText,
    isOpen = $bindable(),
    onbeforeclose,
    onconfirm,
    title,
  }: Props = $props();

  const closeModal = () => {
    onbeforeclose?.();
    isOpen = false;
  };

  const confirmAction = async () => {
    if ((await onconfirm()) !== false) {
      closeModal();
    }
  };
</script>

<Modal bind:isOpen onclose={closeModal} class="flex flex-col gap-y-2">
  <p class="text-xl font-bold">{title}</p>
  {@render children?.()}
  <div class="flex gap-x-2">
    <Button color="gray" onclick={closeModal} class="flex-1">{cancelText}</Button>
    <Button onclick={confirmAction} class="flex-1">{confirmText}</Button>
  </div>
</Modal>
