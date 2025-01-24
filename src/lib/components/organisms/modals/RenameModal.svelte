<script lang="ts">
  import { TextInputModal } from "$lib/components/organisms";

  interface Props {
    isOpen: boolean;
    onbeforeclose?: () => void;
    onrename: (newName: string) => Promise<boolean>;
    originalName: string | undefined;
  }

  let { isOpen = $bindable(), onbeforeclose, onrename, originalName }: Props = $props();
</script>

<TextInputModal
  bind:isOpen
  {onbeforeclose}
  title="이름 바꾸기"
  placeholder="이름"
  defaultValue={originalName}
  submitText="바꾸기"
  onsubmit={onrename}
/>
