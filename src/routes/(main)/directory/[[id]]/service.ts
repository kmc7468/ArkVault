import ExifReader from "exifreader";
import { callGetApi, callPostApi } from "$lib/hooks";
import { storeHmacSecrets } from "$lib/indexedDB";
import { deleteFileCache } from "$lib/modules/cache";
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
  DuplicateFileScanRequest,
  DuplicateFileScanResponse,
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

export const requestDuplicateFileScan = async (file: File, hmacSecret: HmacSecret) => {
  const fileBuffer = await file.arrayBuffer();
  const fileSigned = encodeToBase64(await signMessageHmac(fileBuffer, hmacSecret.secret));
  const res = await callPostApi<DuplicateFileScanRequest>("/api/file/scanDuplicates", {
    hskVersion: hmacSecret.version,
    contentHmac: fileSigned,
  });
  if (!res.ok) return null;

  const { files }: DuplicateFileScanResponse = await res.json();
  return {
    fileBuffer,
    fileSigned,
    isDuplicate: files.length > 0,
  };
};

const extractExifDateTime = (fileBuffer: ArrayBuffer) => {
  const exif = ExifReader.load(fileBuffer);
  const dateTimeOriginal = exif["DateTimeOriginal"]?.description;
  const offsetTimeOriginal = exif["OffsetTimeOriginal"]?.description;
  if (!dateTimeOriginal) return undefined;

  const [date, time] = dateTimeOriginal.split(" ");
  if (!date || !time) return undefined;

  const [year, month, day] = date.split(":").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);
  if (!year || !month || !day || !hour || !minute || !second) return undefined;

  if (!offsetTimeOriginal) {
    // No timezone information -> Local timezone
    return new Date(year, month - 1, day, hour, minute, second);
  }

  const offsetSign = offsetTimeOriginal[0] === "+" ? 1 : -1;
  const [offsetHour, offsetMinute] = offsetTimeOriginal.slice(1).split(":").map(Number);

  const utcDate = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetMs = offsetSign * ((offsetHour ?? 0) * 60 + (offsetMinute ?? 0)) * 60 * 1000;
  return new Date(utcDate - offsetMs);
};

export const requestFileUpload = async (
  file: File,
  fileBuffer: ArrayBuffer,
  fileSigned: string,
  parentId: "root" | number,
  masterKey: MasterKey,
  hmacSecret: HmacSecret,
) => {
  let createdAt = undefined;
  if (file.type.startsWith("image/")) {
    createdAt = extractExifDateTime(fileBuffer);
  }

  const { dataKey, dataKeyVersion } = await generateDataKey();
  const fileEncrypted = await encryptData(fileBuffer, dataKey);
  const nameEncrypted = await encryptString(file.name, dataKey);
  const createdAtEncrypted =
    createdAt && (await encryptString(createdAt.getTime().toString(), dataKey));
  const lastModifiedAtEncrypted = await encryptString(file.lastModified.toString(), dataKey);

  const form = new FormData();
  form.set(
    "metadata",
    JSON.stringify({
      parentId,
      mekVersion: masterKey.version,
      dek: await wrapDataKey(dataKey, masterKey.key),
      dekVersion: dataKeyVersion.toISOString(),
      hskVersion: hmacSecret.version,
      contentHmac: fileSigned,
      contentType: file.type,
      contentIv: fileEncrypted.iv,
      name: nameEncrypted.ciphertext,
      nameIv: nameEncrypted.iv,
      createdAt: createdAtEncrypted?.ciphertext,
      createdAtIv: createdAtEncrypted?.iv,
      lastModifiedAt: lastModifiedAtEncrypted.ciphertext,
      lastModifiedAtIv: lastModifiedAtEncrypted.iv,
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
  await deleteFileCache(entry.id);
};
