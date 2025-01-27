import { getContext, setContext } from "svelte";
import { callPostApi } from "$lib/hooks";
import { encryptString } from "$lib/modules/crypto";
import type { SelectedCategory } from "$lib/components/molecules";
import type { CategoryRenameRequest } from "$lib/server/schemas";

export { requestCategoryCreation, requestFileRemovalFromCategory } from "$lib/services/category";

export const createContext = () => {
  const context = $state({
    selectedCategory: undefined as SelectedCategory | undefined,
  });
  return setContext("context", context);
};

export const useContext = () => {
  return getContext<ReturnType<typeof createContext>>("context");
};

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
