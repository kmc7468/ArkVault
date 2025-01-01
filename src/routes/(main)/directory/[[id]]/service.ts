import { callSignedPostApi } from "$lib/hooks";
import {
  encodeToBase64,
  decodeFromBase64,
  generateAESDataKey,
  encryptAESPlaintext,
  decryptAESCiphertext,
  wrapAESDataKey,
  unwrapAESDataKey,
} from "$lib/modules/crypto";
import type { DirectroyInfoResponse, DirectoryCreateRequest } from "$lib/server/schemas";
import type { MasterKey } from "$lib/stores";

export const decryptDirectroyMetadata = async (
  metadata: NonNullable<DirectroyInfoResponse["metadata"]>,
  masterKey: CryptoKey,
) => {
  const dataDecryptKey = await unwrapAESDataKey(decodeFromBase64(metadata.dek), masterKey);
  return {
    name: new TextDecoder().decode(
      await decryptAESCiphertext(
        decodeFromBase64(metadata.name),
        decodeFromBase64(metadata.nameIv),
        dataDecryptKey,
      ),
    ),
  };
};

export const requestDirectroyCreation = async (
  name: string,
  parentId: "root" | number,
  masterKey: MasterKey,
  signKey: CryptoKey,
) => {
  const dataKey = await generateAESDataKey();
  const nameEncrypted = await encryptAESPlaintext(new TextEncoder().encode(name), dataKey);
  return await callSignedPostApi<DirectoryCreateRequest>(
    "/api/directory/create",
    {
      parentId,
      mekVersion: masterKey.version,
      dek: encodeToBase64(await wrapAESDataKey(dataKey, masterKey.key)),
      name: encodeToBase64(nameEncrypted.ciphertext),
      nameIv: encodeToBase64(nameEncrypted.iv.buffer),
    },
    signKey,
  );
};
