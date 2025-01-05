import { unwrapDataKey, decryptString } from "$lib/modules/crypto";
import type { FileInfoResponse } from "$lib/server/schemas";

export const decryptFileMetadata = async (metadata: FileInfoResponse, masterKey: CryptoKey) => {
  const { dataKey } = await unwrapDataKey(metadata.dek, masterKey);
  return {
    dataKey,
    name: await decryptString(metadata.name, metadata.nameIv, dataKey),
  };
};
