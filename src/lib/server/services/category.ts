import { error } from "@sveltejs/kit";
import {
  registerCategory,
  getAllCategoriesByParent,
  getCategory,
  type CategoryId,
  type NewCategory,
} from "$lib/server/db/category";
import { IntegrityError } from "$lib/server/db/error";

export const getCategoryInformation = async (userId: number, categoryId: CategoryId) => {
  const category = categoryId !== "root" ? await getCategory(userId, categoryId) : undefined;
  if (category === null) {
    error(404, "Invalid category id");
  }

  const categories = await getAllCategoriesByParent(userId, categoryId);
  return {
    metadata: category && {
      parentId: category.parentId ?? ("root" as const),
      mekVersion: category.mekVersion,
      encDek: category.encDek,
      dekVersion: category.dekVersion,
      encName: category.encName,
    },
    categories: categories.map(({ id }) => id),
  };
};

export const createCategory = async (params: NewCategory) => {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const oneMinuteLater = new Date(Date.now() + 60 * 1000);
  if (params.dekVersion <= oneMinuteAgo || params.dekVersion >= oneMinuteLater) {
    error(400, "Invalid DEK version");
  }

  try {
    await registerCategory(params);
  } catch (e) {
    if (e instanceof IntegrityError && e.message === "Inactive MEK version") {
      error(400, "Inactive MEK version");
    }
    throw e;
  }
};
