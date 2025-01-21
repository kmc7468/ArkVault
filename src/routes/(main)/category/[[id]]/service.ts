import { callPostApi } from "$lib/hooks";
import { generateDataKey, wrapDataKey, encryptString } from "$lib/modules/crypto";
import type { CategoryCreateRequest } from "$lib/server/schemas";
import type { MasterKey } from "$lib/stores";

export interface SelectedSubCategory {
  id: number;
  dataKey: CryptoKey;
  dataKeyVersion: Date;
  name: string;
}

export const requestCategoryCreation = async (
  name: string,
  parentId: "root" | number,
  masterKey: MasterKey,
) => {
  const { dataKey, dataKeyVersion } = await generateDataKey();
  const nameEncrypted = await encryptString(name, dataKey);
  await callPostApi<CategoryCreateRequest>("/api/category/create", {
    parent: parentId,
    mekVersion: masterKey.version,
    dek: await wrapDataKey(dataKey, masterKey.key),
    dekVersion: dataKeyVersion.toISOString(),
    name: nameEncrypted.ciphertext,
    nameIv: nameEncrypted.iv,
  });
};
