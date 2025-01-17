import { getFileCache, storeFileCache, downloadFile } from "$lib/modules/file";
import { formatFileSize } from "$lib/modules/util";

export const requestFileDownload = async (
  fileId: number,
  fileEncryptedIv: string,
  dataKey: CryptoKey,
) => {
  const cache = await getFileCache(fileId);
  if (cache) return cache;

  const fileBuffer = await downloadFile(fileId, fileEncryptedIv, dataKey);
  storeFileCache(fileId, fileBuffer); // Intended
  return fileBuffer;
};

export const formatDownloadProgress = (progress?: number) => {
  return `${Math.floor((progress ?? 0) * 100)}%`;
};

export const formatDownloadRate = (rate?: number) => {
  return `${formatFileSize((rate ?? 0) / 8)}/s`;
};
