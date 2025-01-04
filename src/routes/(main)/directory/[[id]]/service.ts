import { callSignedPostApi } from "$lib/hooks";
import {
  encodeToBase64,
  decodeFromBase64,
  generateDataKey,
  wrapDataKey,
  unwrapDataKey,
  encryptData,
  decryptData,
  digestMessage,
  signRequestBody,
} from "$lib/modules/crypto";
import type {
  DirectroyInfoResponse,
  DirectoryCreateRequest,
  FileUploadRequest,
} from "$lib/server/schemas";
import type { MasterKey } from "$lib/stores";

export const decryptDirectroyMetadata = async (
  metadata: NonNullable<DirectroyInfoResponse["metadata"]>,
  masterKey: CryptoKey,
) => {
  const { dataKey } = await unwrapDataKey(metadata.dek, masterKey);
  return {
    name: new TextDecoder().decode(
      await decryptData(decodeFromBase64(metadata.name), metadata.nameIv, dataKey),
    ),
  };
};

export const requestDirectroyCreation = async (
  name: string,
  parentId: "root" | number,
  masterKey: MasterKey,
  signKey: CryptoKey,
) => {
  const { dataKey } = await generateDataKey();
  const nameEncrypted = await encryptData(new TextEncoder().encode(name), dataKey);
  return await callSignedPostApi<DirectoryCreateRequest>(
    "/api/directory/create",
    {
      parentId,
      mekVersion: masterKey.version,
      dek: await wrapDataKey(dataKey, masterKey.key),
      name: encodeToBase64(nameEncrypted.ciphertext),
      nameIv: nameEncrypted.iv,
    },
    signKey,
  );
};

export const requestFileUpload = async (
  file: File,
  parentId: "root" | number,
  masterKey: MasterKey,
  signKey: CryptoKey,
) => {
  const { dataKey } = await generateDataKey();
  const fileEncrypted = await encryptData(await file.arrayBuffer(), dataKey);
  const fileEncryptedHash = await digestMessage(fileEncrypted.ciphertext);
  const nameEncrypted = await encryptData(new TextEncoder().encode(file.name), dataKey);

  const form = new FormData();
  form.set(
    "metadata",
    await signRequestBody<FileUploadRequest>(
      {
        parentId,
        mekVersion: masterKey.version,
        dek: await wrapDataKey(dataKey, masterKey.key),
        contentHash: encodeToBase64(fileEncryptedHash),
        contentIv: fileEncrypted.iv,
        name: encodeToBase64(nameEncrypted.ciphertext),
        nameIv: nameEncrypted.iv,
      },
      signKey,
    ),
  );
  form.set("content", new Blob([fileEncrypted.ciphertext]));

  // TODO: Progress, Scheduling, ...
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/file/upload");
  xhr.send(form);
};
