import type { Writable } from "svelte/store";

export type DirectoryInfo =
  | {
      id: "root";
      dataKey?: undefined;
      dataKeyVersion?: undefined;
      name?: undefined;
      subDirectoryIds: number[];
      fileIds: number[];
    }
  | {
      id: number;
      dataKey: CryptoKey;
      dataKeyVersion: Date;
      name: string;
      subDirectoryIds: number[];
      fileIds: number[];
    };

export interface FileInfo {
  id: number;
  dataKey: CryptoKey;
  dataKeyVersion: Date;
  contentType: string;
  contentIv: string;
  name: string;
}

export const directoryInfoStore = new Map<"root" | number, Writable<DirectoryInfo | null>>();
export const fileInfoStore = new Map<number, Writable<FileInfo | null>>();
