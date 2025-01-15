import { writable, type Writable } from "svelte/store";

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
  createdAt?: Date;
  lastModifiedAt: Date;
}

export interface FileUploadStatus {
  name: string;
  parentId: "root" | number;
  status:
    | "encryption-pending"
    | "encrypting"
    | "upload-pending"
    | "uploading"
    | "uploaded"
    | "canceled"
    | "error";
  progress?: number;
  rate?: number;
  estimated?: number;
}

export const directoryInfoStore = new Map<"root" | number, Writable<DirectoryInfo | null>>();

export const fileInfoStore = new Map<number, Writable<FileInfo | null>>();

export const fileUploadStatusStore = writable<Writable<FileUploadStatus>[]>([]);
