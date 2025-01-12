<script lang="ts">
  import { goto } from "$app/navigation";
  import { EntryButton } from "$lib/components/buttons";

  import IconPassword from "~icons/material-symbols/password";

  let { data } = $props();
</script>

<svelte:head>
  <title>메뉴</title>
</svelte:head>

<div class="sticky top-0 bg-white px-6 py-4">
  <p class="font-semibold">{data.nickname}</p>
</div>
<div class="space-y-4 px-4 pb-4">
  <div class="space-y-2">
    <p class="font-semibold">보안</p>
    <EntryButton onclick={() => goto("/auth/changePassword")}>
      <div class="flex items-center gap-x-4">
        <div class="rounded-lg bg-gray-200 p-1 text-blue-500">
          <IconPassword />
        </div>
        <p class="font-medium">비밀번호 바꾸기</p>
      </div>
    </EntryButton>
  </div>
</div>
