import { getFileCacheIndex, storeFileCacheIndex, type FileCacheIndex } from "$lib/indexedDB";
import { readFileFromOpfs, writeFileToOpfs } from "$lib/modules/opfs";

const fileCacheIndex = new Map<number, FileCacheIndex>();

export const prepareFileCache = async () => {
  for (const cache of await getFileCacheIndex()) {
    fileCacheIndex.set(cache.fileId, cache);
  }
};

export const getFileCache = async (fileId: number) => {
  const cacheIndex = fileCacheIndex.get(fileId);
  if (!cacheIndex) return null;

  cacheIndex.lastRetrievedAt = new Date();
  storeFileCacheIndex(cacheIndex); // Intended
  return await readFileFromOpfs(`/cache/${fileId}`);
};

export const storeFileCache = async (fileId: number, fileBuffer: ArrayBuffer) => {
  const now = new Date();
  await writeFileToOpfs(`/cache/${fileId}`, fileBuffer);

  const cacheIndex: FileCacheIndex = {
    fileId,
    cachedAt: now,
    lastRetrievedAt: now,
    size: fileBuffer.byteLength,
  };
  fileCacheIndex.set(fileId, cacheIndex);
  await storeFileCacheIndex(cacheIndex);
};
