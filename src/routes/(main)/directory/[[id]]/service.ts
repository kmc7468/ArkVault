import { callPostApi } from "$lib/hooks";
import {
  encodeToBase64,
  generateDataKey,
  wrapDataKey,
  unwrapDataKey,
  encryptData,
  encryptString,
  decryptString,
} from "$lib/modules/crypto";
import type {
  DirectoryRenameRequest,
  DirectoryInfoResponse,
  DirectoryCreateRequest,
  FileRenameRequest,
  FileUploadRequest,
} from "$lib/server/schemas";
import type { MasterKey } from "$lib/stores";

export { decryptFileMetadata } from "$lib/services/file";

export interface SelectedDirectoryEntry {
  type: "directory" | "file";
  id: number;
  dataKey: CryptoKey;
  dataKeyVersion: Date;
  name: string;
}

export const decryptDirectoryMetadata = async (
  metadata: NonNullable<DirectoryInfoResponse["metadata"]>,
  masterKey: CryptoKey,
) => {
  const { dataKey } = await unwrapDataKey(metadata.dek, masterKey);
  return {
    dataKey,
    dataKeyVersion: metadata.dekVersion,
    name: await decryptString(metadata.name, metadata.nameIv, dataKey),
  };
};

export const requestDirectoryCreation = async (
  name: string,
  parentId: "root" | number,
  masterKey: MasterKey,
) => {
  const { dataKey, dataKeyVersion } = await generateDataKey();
  const nameEncrypted = await encryptData(new TextEncoder().encode(name), dataKey);
  return await callPostApi<DirectoryCreateRequest>("/api/directory/create", {
    parentId,
    mekVersion: masterKey.version,
    dek: await wrapDataKey(dataKey, masterKey.key),
    dekVersion: dataKeyVersion,
    name: encodeToBase64(nameEncrypted.ciphertext),
    nameIv: nameEncrypted.iv,
  });
};

export const requestFileUpload = async (
  file: File,
  parentId: "root" | number,
  masterKey: MasterKey,
) => {
  const { dataKey, dataKeyVersion } = await generateDataKey();
  const fileEncrypted = await encryptData(await file.arrayBuffer(), dataKey);
  const nameEncrypted = await encryptString(file.name, dataKey);

  const form = new FormData();
  form.set(
    "metadata",
    JSON.stringify({
      parentId,
      mekVersion: masterKey.version,
      dek: await wrapDataKey(dataKey, masterKey.key),
      dekVersion: dataKeyVersion,
      contentIv: fileEncrypted.iv,
      name: nameEncrypted.ciphertext,
      nameIv: nameEncrypted.iv,
    } satisfies FileUploadRequest),
  );
  form.set("content", new Blob([fileEncrypted.ciphertext]));

  // TODO: Progress, Scheduling, ...
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/file/upload");
  xhr.send(form);
};

export const requestDirectoryEntryRename = async (
  entry: SelectedDirectoryEntry,
  newName: string,
) => {
  const newNameEncrypted = await encryptString(newName, entry.dataKey);

  if (entry.type === "directory") {
    await callPostApi<DirectoryRenameRequest>(`/api/directory/${entry.id}/rename`, {
      dekVersion: entry.dataKeyVersion,
      name: newNameEncrypted.ciphertext,
      nameIv: newNameEncrypted.iv,
    });
  } else {
    await callPostApi<FileRenameRequest>(`/api/file/${entry.id}/rename`, {
      dekVersion: entry.dataKeyVersion,
      name: newNameEncrypted.ciphertext,
      nameIv: newNameEncrypted.iv,
    });
  }
};

export const requestDirectoryEntryDeletion = async (entry: SelectedDirectoryEntry) => {
  await callPostApi(`/api/${entry.type}/${entry.id}/delete`);
};
