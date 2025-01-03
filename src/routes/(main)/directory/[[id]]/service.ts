import { callSignedPostApi } from "$lib/hooks";
import {
  encodeToBase64,
  decodeFromBase64,
  generateDataKey,
  wrapDataKey,
  unwrapDataKey,
  encryptData,
  decryptData,
} from "$lib/modules/crypto";
import type { DirectroyInfoResponse, DirectoryCreateRequest } from "$lib/server/schemas";
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
