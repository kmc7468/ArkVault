<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { AdaptiveDiv } from "$lib/components/divs";

  import IconHome from "~icons/material-symbols/home";
  import IconFolder from "~icons/material-symbols/folder";
  import IconFavorite from "~icons/material-symbols/favorite";
  import IconCategory from "~icons/material-symbols/category";
  import IconMenu from "~icons/material-symbols/menu";

  const pages = [
    { path: "/home", label: "홈", icon: IconHome },
    { path: "/directory", label: "파일", icon: IconFolder },
    { path: "/favorite", label: "즐겨찾기", icon: IconFavorite },
    { path: "/category", label: "카테고리", icon: IconCategory },
    { path: "/menu", label: "전체", icon: IconMenu },
  ];

  // TODO: Navigation
</script>

<div
  class="sticky bottom-0 h-20 w-full flex-shrink-0 rounded-t-2xl border-t border-gray-300 bg-white"
>
  <AdaptiveDiv>
    <div class="flex w-full justify-evenly px-4 py-2">
      {#each pages as { path, label, icon: Icon }}
        {@const textColor = !page.url.pathname.startsWith(path) ? "text-gray-600" : ""}
        <button
          onclick={() => goto(path)}
          class="w-16 active:rounded-xl active:bg-gray-100 {textColor}"
        >
          <div class="gap-y flex flex-col items-center gap-y-1 p-1 transition active:scale-95">
            <Icon class="text-xl" fill="0" />
            <p class="text-sm">{label}</p>
          </div>
        </button>
      {/each}
    </div>
  </AdaptiveDiv>
</div>
