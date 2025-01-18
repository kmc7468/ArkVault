import { getFileCache, storeFileCache, downloadFile } from "$lib/modules/file";

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
