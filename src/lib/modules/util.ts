const pad2 = (num: number) => num.toString().padStart(2, "0");

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}. ${month}. ${day}.`;
};

export const formatDateTime = (date: Date) => {
  const dateFormatted = formatDate(date);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${dateFormatted} ${pad2(hours)}:${pad2(minutes)}`;
};

export const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KiB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MiB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GiB`;
};

export const formatNetworkSpeed = (speed: number) => {
  if (speed < 1000) return `${speed} bps`;
  if (speed < 1000 * 1000) return `${(speed / 1000).toFixed(1)} kbps`;
  if (speed < 1000 * 1000 * 1000) return `${(speed / 1000 / 1000).toFixed(1)} Mbps`;
  return `${(speed / 1000 / 1000 / 1000).toFixed(1)} Gbps`;
};

export enum SortBy {
  NAME_ASC,
  NAME_DESC,
}

type SortFunc = (a?: string, b?: string) => number;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const sortByNameAsc: SortFunc = (a, b) => {
  if (a && b) return collator.compare(a, b);
  if (a) return -1;
  if (b) return 1;
  return 0;
};

const sortByNameDesc: SortFunc = (a, b) => -sortByNameAsc(a, b);

export const sortEntries = <T extends { name?: string }>(entries: T[], sortBy: SortBy) => {
  let sortFunc: SortFunc;
  if (sortBy === SortBy.NAME_ASC) {
    sortFunc = sortByNameAsc;
  } else {
    sortFunc = sortByNameDesc;
  }

  entries.sort((a, b) => sortFunc(a.name, b.name));
};
