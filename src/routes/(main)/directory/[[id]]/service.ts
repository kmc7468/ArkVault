import { callPostApi } from "$lib/hooks";
import {
  encodeToBase64,
  generateDataKey,
  wrapDataKey,
  encryptData,
  encryptString,
} from "$lib/modules/crypto";
import type {
  DirectoryRenameRequest,
  DirectoryCreateRequest,
  FileRenameRequest,
  FileUploadRequest,
} from "$lib/server/schemas";
import type { MasterKey } from "$lib/stores";

export interface SelectedDirectoryEntry {
  type: "directory" | "file";
  id: number;
  dataKey: CryptoKey;
  dataKeyVersion: Date;
  name: string;
}

export const requestDirectoryCreation = async (
  name: string,
  parentId: "root" | number,
  masterKey: MasterKey,
) => {
  const { dataKey, dataKeyVersion } = await generateDataKey();
  const nameEncrypted = await encryptData(new TextEncoder().encode(name), dataKey);
  await callPostApi<DirectoryCreateRequest>("/api/directory/create", {
    parentId,
    mekVersion: masterKey.version,
    dek: await wrapDataKey(dataKey, masterKey.key),
    dekVersion: dataKeyVersion,
    name: encodeToBase64(nameEncrypted.ciphertext),
    nameIv: nameEncrypted.iv,
  });
};

export const requestFileUpload = (file: File, parentId: "root" | number, masterKey: MasterKey) => {
  return new Promise<void>(async (resolve, reject) => {
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
        contentType: file.type,
        contentIv: fileEncrypted.iv,
        name: nameEncrypted.ciphertext,
        nameIv: nameEncrypted.iv,
      } satisfies FileUploadRequest),
    );
    form.set("content", new Blob([fileEncrypted.ciphertext]));

    // TODO: Progress, Scheduling, ...
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(xhr.responseText));
      }
    });

    xhr.open("POST", "/api/file/upload");
    xhr.send(form);
  });
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
