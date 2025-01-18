import { deleteFileCache as doDeleteFileCache } from "$lib/modules/file";

export const deleteFileCache = async (fileId: number) => {
  await doDeleteFileCache(fileId);
};
