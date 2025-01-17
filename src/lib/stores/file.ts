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

export const fileUploadStatusStore = writable<Writable<FileUploadStatus>[]>([]);
