import { callPostApi } from "$lib/hooks";
import { encryptString } from "$lib/modules/crypto";
import type { SelectedCategory } from "$lib/molecules/Categories";
import type { CategoryRenameRequest } from "$lib/server/schemas";

export { requestCategoryCreation } from "$lib/services/category";

export const requestCategoryRename = async (category: SelectedCategory, newName: string) => {
  const newNameEncrypted = await encryptString(newName, category.dataKey);

  const res = await callPostApi<CategoryRenameRequest>(`/api/category/${category.id}/rename`, {
    dekVersion: category.dataKeyVersion.toISOString(),
    name: newNameEncrypted.ciphertext,
    nameIv: newNameEncrypted.iv,
  });
  return res.ok;
};

export const requestCategoryDeletion = async (category: SelectedCategory) => {
  const res = await callPostApi(`/api/category/${category.id}/delete`);
  return res.ok;
};
