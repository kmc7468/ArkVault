import axios from "axios";
import { limitFunction } from "p-limit";
import { writable, type Writable } from "svelte/store";
import { decryptData } from "$lib/modules/crypto";
import { fileDownloadStatusStore, type FileDownloadStatus } from "$lib/stores";

const requestFileDownload = limitFunction(
  async (status: Writable<FileDownloadStatus>, id: number) => {
    status.update((value) => {
      value.status = "downloading";
      return value;
    });

    const res = await axios.get(`/api/file/${id}/download`, {
      responseType: "arraybuffer",
      onDownloadProgress: ({ progress, rate, estimated }) => {
        status.update((value) => {
          value.progress = progress;
          value.rate = rate;
          value.estimated = estimated;
          return value;
        });
      },
    });
    const fileEncrypted: ArrayBuffer = res.data;

    status.update((value) => {
      value.status = "decryption-pending";
      return value;
    });
    return fileEncrypted;
  },
  { concurrency: 1 },
);

const decryptFile = limitFunction(
  async (
    status: Writable<FileDownloadStatus>,
    fileEncrypted: ArrayBuffer,
    fileEncryptedIv: string,
    dataKey: CryptoKey,
  ) => {
    status.update((value) => {
      value.status = "decrypting";
      return value;
    });

    const fileBuffer = await decryptData(fileEncrypted, fileEncryptedIv, dataKey);

    status.update((value) => {
      value.status = "decrypted";
      value.result = fileBuffer;
      return value;
    });
    return fileBuffer;
  },
  { concurrency: 4 },
);

export const downloadFile = async (id: number, fileEncryptedIv: string, dataKey: CryptoKey) => {
  const status = writable<FileDownloadStatus>({
    id,
    status: "download-pending",
  });
  fileDownloadStatusStore.update((value) => {
    value.push(status);
    return value;
  });

  try {
    return await decryptFile(
      status,
      await requestFileDownload(status, id),
      fileEncryptedIv,
      dataKey,
    );
  } catch (e) {
    status.update((value) => {
      value.status = "error";
      return value;
    });
    throw e;
  }
};
