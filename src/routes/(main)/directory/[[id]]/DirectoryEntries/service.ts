import { get, type Writable } from "svelte/store";
import type { DirectoryInfo, FileInfo } from "$lib/stores";

export enum SortBy {
  NAME_ASC,
  NAME_DESC,
}

type SortFunc = (a: DirectoryInfo | FileInfo | null, b: DirectoryInfo | FileInfo | null) => number;

const sortByNameAsc: SortFunc = (a, b) => {
  if (a && b) return a.name!.localeCompare(b.name!);
  return 0;
};

const sortByNameDesc: SortFunc = (a, b) => -sortByNameAsc(a, b);

export const sortEntries = <T extends DirectoryInfo | FileInfo>(
  entries: Writable<T | null>[],
  sortBy: SortBy = SortBy.NAME_ASC,
) => {
  let sortFunc: SortFunc;
  if (sortBy === SortBy.NAME_ASC) {
    sortFunc = sortByNameAsc;
  } else {
    sortFunc = sortByNameDesc;
  }

  entries.sort((a, b) => sortFunc(get(a), get(b)));
};
