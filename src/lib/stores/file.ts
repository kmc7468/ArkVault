import { writable, type Writable } from "svelte/store";
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

export interface FileDownloadStatus {
  id: number;
  status:
    | "download-pending"
    | "downloading"
    | "decryption-pending"
    | "decrypting"
    | "decrypted"
    | "canceled"
    | "error";
  progress?: number;
  rate?: number;
  estimated?: number;
  result?: ArrayBuffer;
}

export const fileUploadStatusStore = writable<Writable<FileUploadStatus>[]>([]);

export const fileDownloadStatusStore = writable<Writable<FileDownloadStatus>[]>([]);
