import { callPostApi } from "$lib/hooks";
import { generateDataKey, wrapDataKey, encryptString } from "$lib/modules/crypto";
import type { CategoryCreateRequest, CategoryFileRemoveRequest } from "$lib/server/schemas";
import type { MasterKey } from "$lib/stores";

export const requestCategoryCreation = async (
  name: string,
  parentId: "root" | number,
  masterKey: MasterKey,
) => {
  const { dataKey, dataKeyVersion } = await generateDataKey();
  const nameEncrypted = await encryptString(name, dataKey);

  const res = await callPostApi<CategoryCreateRequest>("/api/category/create", {
    parent: parentId,
    mekVersion: masterKey.version,
    dek: await wrapDataKey(dataKey, masterKey.key),
    dekVersion: dataKeyVersion.toISOString(),
    name: nameEncrypted.ciphertext,
    nameIv: nameEncrypted.iv,
  });
  return res.ok;
};

export const requestFileRemovalFromCategory = async (fileId: number, categoryId: number) => {
  const res = await callPostApi<CategoryFileRemoveRequest>(
    `/api/category/${categoryId}/file/remove`,
    { file: fileId },
  );
  return res.ok;
};
