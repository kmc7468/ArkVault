import { callGetApi, callPostApi } from "$lib/hooks";
import { storeHmacSecrets } from "$lib/indexedDB";
import {
  encodeToBase64,
  generateDataKey,
  wrapDataKey,
  unwrapHmacSecret,
  encryptData,
  encryptString,
  signMessageHmac,
} from "$lib/modules/crypto";
import type {
  DirectoryRenameRequest,
  DirectoryCreateRequest,
  FileRenameRequest,
  FileUploadRequest,
  HmacSecretListResponse,
} from "$lib/server/schemas";
import { hmacSecretStore, type MasterKey, type HmacSecret } from "$lib/stores";

export interface SelectedDirectoryEntry {
  type: "directory" | "file";
  id: number;
  dataKey: CryptoKey;
  dataKeyVersion: Date;
  name: string;
}

export const requestHmacSecretDownload = async (masterKey: CryptoKey) => {
  // TODO: MEK rotation

  const res = await callGetApi("/api/hsk/list");
  if (!res.ok) return false;

  const { hsks: hmacSecretsWrapped }: HmacSecretListResponse = await res.json();
  const hmacSecrets = await Promise.all(
    hmacSecretsWrapped.map(async ({ version, state, hsk: hmacSecretWrapped }) => {
      const { hmacSecret } = await unwrapHmacSecret(hmacSecretWrapped, masterKey);
      return { version, state, secret: hmacSecret };
    }),
  );

  await storeHmacSecrets(hmacSecrets);
  hmacSecretStore.set(new Map(hmacSecrets.map((hmacSecret) => [hmacSecret.version, hmacSecret])));

  return true;
};

export const requestDirectoryCreation = async (
  name: string,
  parentId: "root" | number,
  masterKey: MasterKey,
) => {
  const { dataKey, dataKeyVersion } = await generateDataKey();
  const nameEncrypted = await encryptString(name, dataKey);
  await callPostApi<DirectoryCreateRequest>("/api/directory/create", {
    parentId,
    mekVersion: masterKey.version,
    dek: await wrapDataKey(dataKey, masterKey.key),
    dekVersion: dataKeyVersion.toISOString(),
    name: nameEncrypted.ciphertext,
    nameIv: nameEncrypted.iv,
  });
};

export const requestFileUpload = async (
  file: File,
  parentId: "root" | number,
  masterKey: MasterKey,
  hmacSecret: HmacSecret,
) => {
  const { dataKey, dataKeyVersion } = await generateDataKey();
  const nameEncrypted = await encryptString(file.name, dataKey);

  const fileBuffer = await file.arrayBuffer();
  const fileSigned = await signMessageHmac(fileBuffer, hmacSecret.secret);
  const fileEncrypted = await encryptData(fileBuffer, dataKey);

  const form = new FormData();
  form.set(
    "metadata",
    JSON.stringify({
      parentId,
      mekVersion: masterKey.version,
      dek: await wrapDataKey(dataKey, masterKey.key),
      dekVersion: dataKeyVersion.toISOString(),
      hskVersion: hmacSecret.version,
      contentHmac: encodeToBase64(fileSigned),
      contentType: file.type,
      contentIv: fileEncrypted.iv,
      name: nameEncrypted.ciphertext,
      nameIv: nameEncrypted.iv,
    } satisfies FileUploadRequest),
  );
  form.set("content", new Blob([fileEncrypted.ciphertext]));

  return new Promise<void>((resolve, reject) => {
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
      dekVersion: entry.dataKeyVersion.toISOString(),
      name: newNameEncrypted.ciphertext,
      nameIv: newNameEncrypted.iv,
    });
  } else {
    await callPostApi<FileRenameRequest>(`/api/file/${entry.id}/rename`, {
      dekVersion: entry.dataKeyVersion.toISOString(),
      name: newNameEncrypted.ciphertext,
      nameIv: newNameEncrypted.iv,
    });
  }
};

export const requestDirectoryEntryDeletion = async (entry: SelectedDirectoryEntry) => {
  await callPostApi(`/api/${entry.type}/${entry.id}/delete`);
};
