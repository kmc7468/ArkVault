import { callPostApi } from "$lib/hooks";
import { getFileCache, storeFileCache, downloadFile } from "$lib/modules/file";
import type { CategoryFileAddRequest, CategoryFileRemoveRequest } from "$lib/server/schemas";

export { requestCategoryCreation } from "$lib/services/category";

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

export const requestFileRemovalFromCategory = async (fileId: number, categoryId: number) => {
  const res = await callPostApi<CategoryFileRemoveRequest>(
    `/api/category/${categoryId}/file/remove`,
    { file: fileId },
  );
  return res.ok;
};
