import { get, writable, type Writable } from "svelte/store";
import { callGetApi } from "$lib/hooks";
import {
  getDirectoryInfos as getDirectoryInfosFromIndexedDB,
  getDirectoryInfo as getDirectoryInfoFromIndexedDB,
  storeDirectoryInfo,
  getFileInfos as getFileInfosFromIndexedDB,
  getFileInfo as getFileInfoFromIndexedDB,
  storeFileInfo,
  type DirectoryId,
} from "$lib/indexedDB";
import { unwrapDataKey, decryptString } from "$lib/modules/crypto";
import type { DirectoryInfoResponse, FileInfoResponse } from "$lib/server/schemas";

export type DirectoryInfo =
  | {
      id: "root";
      dataKey?: undefined;
      dataKeyVersion?: undefined;
      name?: undefined;
      subDirectoryIds: number[];
      fileIds: number[];
    }
  | {
      id: number;
      dataKey?: CryptoKey;
      dataKeyVersion?: Date;
      name: string;
      subDirectoryIds: number[];
      fileIds: number[];
    };

export interface FileInfo {
  id: number;
  dataKey?: CryptoKey;
  dataKeyVersion?: Date;
  contentType: string;
  contentIv?: string;
  name: string;
  createdAt?: Date;
  lastModifiedAt: Date;
}

const directoryInfoStore = new Map<DirectoryId, Writable<DirectoryInfo | null>>();
const fileInfoStore = new Map<number, Writable<FileInfo | null>>();

const fetchDirectoryInfoFromIndexedDB = async (
  id: DirectoryId,
  info: Writable<DirectoryInfo | null>,
) => {
  if (get(info)) return;

  const [directory, subDirectories, files] = await Promise.all([
    id !== "root" ? getDirectoryInfoFromIndexedDB(id) : undefined,
    getDirectoryInfosFromIndexedDB(id),
    getFileInfosFromIndexedDB(id),
  ]);
  const subDirectoryIds = subDirectories.map(({ id }) => id);
  const fileIds = files.map(({ id }) => id);

  if (id === "root") {
    info.set({ id, subDirectoryIds, fileIds });
  } else {
    if (!directory) return;
    info.set({ id, name: directory.name, subDirectoryIds, fileIds });
  }
};

const fetchDirectoryInfoFromServer = async (
  id: DirectoryId,
  info: Writable<DirectoryInfo | null>,
  masterKey: CryptoKey,
) => {
  const res = await callGetApi(`/api/directory/${id}`);
  if (!res.ok) throw new Error("Failed to fetch directory information"); // TODO: Handle 404
  const {
    metadata,
    subDirectories: subDirectoryIds,
    files: fileIds,
  }: DirectoryInfoResponse = await res.json();

  if (id === "root") {
    info.set({ id, subDirectoryIds, fileIds });
  } else {
    const { dataKey } = await unwrapDataKey(metadata!.dek, masterKey);
    const name = await decryptString(metadata!.name, metadata!.nameIv, dataKey);

    info.set({
      id,
      dataKey,
      dataKeyVersion: new Date(metadata!.dekVersion),
      name,
      subDirectoryIds,
      fileIds,
    });
    await storeDirectoryInfo({ id, parentId: metadata!.parent, name });
  }
};

const fetchDirectoryInfo = async (
  id: DirectoryId,
  info: Writable<DirectoryInfo | null>,
  masterKey: CryptoKey,
) => {
  await fetchDirectoryInfoFromIndexedDB(id, info);
  await fetchDirectoryInfoFromServer(id, info, masterKey);
};

export const getDirectoryInfo = (id: DirectoryId, masterKey: CryptoKey) => {
  // TODO: MEK rotation

  let info = directoryInfoStore.get(id);
  if (!info) {
    info = writable(null);
    directoryInfoStore.set(id, info);
  }

  fetchDirectoryInfo(id, info, masterKey);
  return info;
};

const fetchFileInfoFromIndexedDB = async (id: number, info: Writable<FileInfo | null>) => {
  if (get(info)) return;

  const file = await getFileInfoFromIndexedDB(id);
  if (!file) return;

  info.set(file);
};

const decryptDate = async (ciphertext: string, iv: string, dataKey: CryptoKey) => {
  return new Date(parseInt(await decryptString(ciphertext, iv, dataKey), 10));
};

const fetchFileInfoFromServer = async (
  id: number,
  info: Writable<FileInfo | null>,
  masterKey: CryptoKey,
) => {
  const res = await callGetApi(`/api/file/${id}`);
  if (!res.ok) throw new Error("Failed to fetch file information"); // TODO: Handle 404
  const metadata: FileInfoResponse = await res.json();

  const { dataKey } = await unwrapDataKey(metadata.dek, masterKey);
  const name = await decryptString(metadata.name, metadata.nameIv, dataKey);
  const createdAt =
    metadata.createdAt && metadata.createdAtIv
      ? await decryptDate(metadata.createdAt, metadata.createdAtIv, dataKey)
      : undefined;
  const lastModifiedAt = await decryptDate(
    metadata.lastModifiedAt,
    metadata.lastModifiedAtIv,
    dataKey,
  );

  info.set({
    id,
    dataKey,
    dataKeyVersion: new Date(metadata.dekVersion),
    contentType: metadata.contentType,
    contentIv: metadata.contentIv,
    name,
    createdAt,
    lastModifiedAt,
  });
  await storeFileInfo({
    id,
    parentId: metadata.parent,
    name,
    contentType: metadata.contentType,
    createdAt,
    lastModifiedAt,
  });
};

const fetchFileInfo = async (id: number, info: Writable<FileInfo | null>, masterKey: CryptoKey) => {
  await fetchFileInfoFromIndexedDB(id, info);
  await fetchFileInfoFromServer(id, info, masterKey);
};

export const getFileInfo = (fileId: number, masterKey: CryptoKey) => {
  // TODO: MEK rotation

  let info = fileInfoStore.get(fileId);
  if (!info) {
    info = writable(null);
    fileInfoStore.set(fileId, info);
  }

  fetchFileInfo(fileId, info, masterKey);
  return info;
};
