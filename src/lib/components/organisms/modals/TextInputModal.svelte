<script lang="ts">
  import { TextInput } from "$lib/components/atoms";
  import { ActionModal, type ConfirmHandler } from "$lib/components/molecules";

  interface Props {
    defaultValue?: string;
    isOpen: boolean;
    onbeforeclose?: () => void;
    onsubmit: (value: string) => ReturnType<ConfirmHandler>;
    placeholder: string;
    submitText: string;
    title: string;
  }

  let {
    defaultValue = "",
    isOpen = $bindable(),
    onbeforeclose,
    onsubmit,
    placeholder,
    submitText,
    title,
  }: Props = $props();

  let value = $state(defaultValue);

  $effect.pre(() => {
    if (isOpen) {
      value = defaultValue;
    }
  });
</script>

<ActionModal
  bind:isOpen
  {onbeforeclose}
  {title}
  confirmText={submitText}
  onconfirm={() => onsubmit(value)}
>
  <TextInput bind:value {placeholder} class="mb-5" />
</ActionModal>
