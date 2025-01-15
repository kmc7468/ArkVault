import { formatFileSize } from "$lib/modules/util";

export { formatDateTime } from "$lib/modules/util";

export enum SortBy {
  NAME_ASC,
  NAME_DESC,
}

type SortFunc = (a?: string, b?: string) => number;

const sortByNameAsc: SortFunc = (a, b) => {
  if (a && b) return a.localeCompare(b);
  if (a) return -1;
  if (b) return 1;
  return 0;
};

const sortByNameDesc: SortFunc = (a, b) => -sortByNameAsc(a, b);

export const sortEntries = <T extends { name?: string }>(
  entries: T[],
  sortBy: SortBy = SortBy.NAME_ASC,
) => {
  let sortFunc: SortFunc;
  if (sortBy === SortBy.NAME_ASC) {
    sortFunc = sortByNameAsc;
  } else {
    sortFunc = sortByNameDesc;
  }

  entries.sort((a, b) => sortFunc(a.name, b.name));
};

export const formatUploadProgress = (progress?: number) => {
  return `${Math.floor((progress ?? 0) * 100)}%`;
};

export const formatUploadRate = (rate?: number) => {
  return `${formatFileSize((rate ?? 0) / 8)}/s`;
};
