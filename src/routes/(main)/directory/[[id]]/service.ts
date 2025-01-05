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
  DirectroyInfoResponse,
  DirectoryCreateRequest,
  FileUploadRequest,
} from "$lib/server/schemas";
import type { MasterKey } from "$lib/stores";

export { decryptFileMetadata } from "$lib/services/file";

export const decryptDirectroyMetadata = async (
  metadata: NonNullable<DirectroyInfoResponse["metadata"]>,
  masterKey: CryptoKey,
) => {
  const { dataKey } = await unwrapDataKey(metadata.dek, masterKey);
  return {
    name: await decryptString(metadata.name, metadata.nameIv, dataKey),
  };
};

export const requestDirectroyCreation = async (
  name: string,
  parentId: "root" | number,
  masterKey: MasterKey,
) => {
  const { dataKey } = await generateDataKey();
  const nameEncrypted = await encryptData(new TextEncoder().encode(name), dataKey);
  return await callPostApi<DirectoryCreateRequest>("/api/directory/create", {
    parentId,
    mekVersion: masterKey.version,
    dek: await wrapDataKey(dataKey, masterKey.key),
    name: encodeToBase64(nameEncrypted.ciphertext),
    nameIv: nameEncrypted.iv,
  });
};

export const requestFileUpload = async (
  file: File,
  parentId: "root" | number,
  masterKey: MasterKey,
) => {
  const { dataKey } = await generateDataKey();
  const fileEncrypted = await encryptData(await file.arrayBuffer(), dataKey);
  const nameEncrypted = await encryptString(file.name, dataKey);

  const form = new FormData();
  form.set(
    "metadata",
    JSON.stringify({
      parentId,
      mekVersion: masterKey.version,
      dek: await wrapDataKey(dataKey, masterKey.key),
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
