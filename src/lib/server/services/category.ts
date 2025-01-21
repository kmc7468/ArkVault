import { error } from "@sveltejs/kit";
import {
  registerCategory,
  getAllCategoriesByParent,
  getCategory,
  type CategoryId,
  type NewCategory,
} from "$lib/server/db/category";
import { IntegrityError } from "$lib/server/db/error";
import { getAllFilesByCategory, getFile, addFileToCategory } from "$lib/server/db/file";

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

export const addCategoryFile = async (userId: number, categoryId: number, fileId: number) => {
  const category = await getCategory(userId, categoryId);
  const file = await getFile(userId, fileId);
  if (!category) {
    error(404, "Invalid category id");
  } else if (!file) {
    error(404, "Invalid file id");
  }

  try {
    await addFileToCategory(fileId, categoryId);
  } catch (e) {
    if (e instanceof IntegrityError && e.message === "File already added to category") {
      error(400, "File already added");
    }
    throw e;
  }
};

export const getCategoryFiles = async (userId: number, categoryId: number) => {
  const category = await getCategory(userId, categoryId);
  if (!category) {
    error(404, "Invalid category id");
  }

  const files = await getAllFilesByCategory(userId, categoryId);
  return { files: files.map(({ id }) => id) };
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
