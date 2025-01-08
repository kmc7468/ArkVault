import { writable } from "svelte/store";
import { callGetApi } from "$lib/hooks";
import { unwrapDataKey, decryptString } from "$lib/modules/crypto";
import type { DirectoryInfoResponse, FileInfoResponse } from "$lib/server/schemas";
import {
  directoryInfoStore,
  fileInfoStore,
  type DirectoryInfo,
  type FileInfo,
} from "$lib/stores/file";

const fetchDirectoryInfo = async (directoryId: "root" | number, masterKey: CryptoKey) => {
  const res = await callGetApi(`/api/directory/${directoryId}`);
  if (!res.ok) throw new Error("Failed to fetch directory information");
  const { metadata, subDirectories, files }: DirectoryInfoResponse = await res.json();

  let newInfo: DirectoryInfo;
  if (directoryId === "root") {
    newInfo = {
      id: "root",
      subDirectoryIds: subDirectories,
      fileIds: files,
    };
  } else {
    const { dataKey } = await unwrapDataKey(metadata!.dek, masterKey);
    newInfo = {
      id: directoryId,
      dataKey,
      dataKeyVersion: new Date(metadata!.dekVersion),
      name: await decryptString(metadata!.name, metadata!.nameIv, dataKey),
      subDirectoryIds: subDirectories,
      fileIds: files,
    };
  }

  const info = directoryInfoStore.get(directoryId);
  if (info) {
    info.update(() => newInfo);
  } else {
    directoryInfoStore.set(directoryId, writable(newInfo));
  }
};

export const getDirectoryInfo = (directoryId: "root" | number, masterKey: CryptoKey) => {
  // TODO: MEK rotation

  let info = directoryInfoStore.get(directoryId);
  if (!info) {
    info = writable(null);
    directoryInfoStore.set(directoryId, info);
  }

  fetchDirectoryInfo(directoryId, masterKey);
  return info;
};

const fetchFileInfo = async (fileId: number, masterKey: CryptoKey) => {
  const res = await callGetApi(`/api/file/${fileId}`);
  if (!res.ok) throw new Error("Failed to fetch file information");
  const metadata: FileInfoResponse = await res.json();

  const { dataKey } = await unwrapDataKey(metadata.dek, masterKey);
  const newInfo: FileInfo = {
    id: fileId,
    dataKey,
    dataKeyVersion: new Date(metadata.dekVersion),
    contentType: metadata.contentType,
    contentIv: metadata.contentIv,
    name: await decryptString(metadata.name, metadata.nameIv, dataKey),
  };

  const info = fileInfoStore.get(fileId);
  if (info) {
    info.update(() => newInfo);
  } else {
    fileInfoStore.set(fileId, writable(newInfo));
  }
};

export const getFileInfo = (fileId: number, masterKey: CryptoKey) => {
  // TODO: MEK rotation

  let info = fileInfoStore.get(fileId);
  if (!info) {
    info = writable(null);
    fileInfoStore.set(fileId, info);
  }

  fetchFileInfo(fileId, masterKey);
  return info;
};
