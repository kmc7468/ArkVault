import { deleteFileCache as doDeleteFileCache } from "$lib/modules/cache";

export { formatDate, formatFileSize } from "$lib/modules/util";

export const deleteFileCache = async (fileId: number) => {
  await doDeleteFileCache(fileId);
};
