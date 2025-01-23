import { callPostApi } from "$lib/hooks";
import { getFileCache, storeFileCache, downloadFile } from "$lib/modules/file";
import type { CategoryFileAddRequest } from "$lib/server/schemas";

export { requestCategoryCreation, requestFileRemovalFromCategory } from "$lib/services/category";

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

export const requestFileAdditionToCategory = async (fileId: number, categoryId: number) => {
  const res = await callPostApi<CategoryFileAddRequest>(`/api/category/${categoryId}/file/add`, {
    file: fileId,
  });
  return res.ok;
};
