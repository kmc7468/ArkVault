import { and, eq, isNull } from "drizzle-orm";
import db from "./drizzle";
import { IntegrityError } from "./error";
import { category, categoryLog, mek } from "./schema";

type CategoryId = "root" | number;

export interface NewCategoryParams {
  parentId: "root" | number;
  userId: number;
  mekVersion: number;
  encDek: string;
  dekVersion: Date;
  encName: string;
  encNameIv: string;
}

export const registerCategory = async (params: NewCategoryParams) => {
  await db.transaction(
    async (tx) => {
      const meks = await tx
        .select({ version: mek.version })
        .from(mek)
        .where(and(eq(mek.userId, params.userId), eq(mek.state, "active")))
        .limit(1);
      if (meks[0]?.version !== params.mekVersion) {
        throw new IntegrityError("Inactive MEK version");
      }

      const newCategories = await tx
        .insert(category)
        .values({
          parentId: params.parentId === "root" ? null : params.parentId,
          userId: params.userId,
          mekVersion: params.mekVersion,
          encDek: params.encDek,
          dekVersion: params.dekVersion,
          encName: { ciphertext: params.encName, iv: params.encNameIv },
        })
        .returning({ id: category.id });
      const { id: categoryId } = newCategories[0]!;
      await tx.insert(categoryLog).values({
        categoryId,
        timestamp: new Date(),
        action: "create",
        newName: { ciphertext: params.encName, iv: params.encNameIv },
      });
    },
    { behavior: "exclusive" },
  );
};

export const getAllCategoriesByParent = async (userId: number, parentId: CategoryId) => {
  return await db
    .select()
    .from(category)
    .where(
      and(
        eq(category.userId, userId),
        parentId === "root" ? isNull(category.parentId) : eq(category.parentId, parentId),
      ),
    );
};

export const getCategory = async (userId: number, categoryId: number) => {
  const res = await db
    .select()
    .from(category)
    .where(and(eq(category.userId, userId), eq(category.id, categoryId)))
    .limit(1);
  return res[0] ?? null;
};

export const setCategoryEncName = async (
  userId: number,
  categoryId: number,
  dekVersion: Date,
  encName: string,
  encNameIv: string,
) => {
  await db.transaction(
    async (tx) => {
      const categories = await tx
        .select({ version: category.dekVersion })
        .from(category)
        .where(and(eq(category.userId, userId), eq(category.id, categoryId)))
        .limit(1);
      if (!categories[0]) {
        throw new IntegrityError("Category not found");
      } else if (categories[0].version.getTime() !== dekVersion.getTime()) {
        throw new IntegrityError("Invalid DEK version");
      }

      await tx
        .update(category)
        .set({ encName: { ciphertext: encName, iv: encNameIv } })
        .where(and(eq(category.userId, userId), eq(category.id, categoryId)));
      await tx.insert(categoryLog).values({
        categoryId,
        timestamp: new Date(),
        action: "rename",
        newName: { ciphertext: encName, iv: encNameIv },
      });
    },
    { behavior: "exclusive" },
  );
};

export const unregisterCategory = async (userId: number, categoryId: number) => {
  await db.delete(category).where(and(eq(category.userId, userId), eq(category.id, categoryId)));
};
