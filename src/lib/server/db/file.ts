import { and, eq, isNull } from "drizzle-orm";
import db from "./drizzle";
import { directory, file, mek } from "./schema";

type DirectroyId = "root" | number;

export interface NewDirectroyParams {
  userId: number;
  parentId: DirectroyId;
  mekVersion: number;
  encDek: string;
  encName: string;
  encNameIv: string;
}

export interface NewFileParams {
  path: string;
  parentId: DirectroyId;
  userId: number;
  mekVersion: number;
  encDek: string;
  encContentIv: string;
  encName: string;
  encNameIv: string;
}

export const registerNewDirectory = async (params: NewDirectroyParams) => {
  return await db.transaction(async (tx) => {
    const meks = await tx
      .select()
      .from(mek)
      .where(and(eq(mek.userId, params.userId), eq(mek.state, "active")));
    if (meks[0]?.version !== params.mekVersion) {
      throw new Error("Invalid MEK version");
    }

    const now = new Date();
    await tx.insert(directory).values({
      createdAt: now,
      parentId: params.parentId === "root" ? null : params.parentId,
      userId: params.userId,
      mekVersion: params.mekVersion,
      encDek: params.encDek,
      encryptedAt: now,
      encName: { ciphertext: params.encName, iv: params.encNameIv },
    });
  });
};

export const getAllDirectoriesByParent = async (userId: number, directoryId: DirectroyId) => {
  return await db
    .select()
    .from(directory)
    .where(
      and(
        eq(directory.userId, userId),
        directoryId === "root" ? isNull(directory.parentId) : eq(directory.parentId, directoryId),
      ),
    )
    .execute();
};

export const getDirectory = async (userId: number, directoryId: number) => {
  const res = await db
    .select()
    .from(directory)
    .where(and(eq(directory.userId, userId), eq(directory.id, directoryId)))
    .execute();
  return res[0] ?? null;
};

export const setDirectoryEncName = async (
  userId: number,
  directoryId: number,
  encName: string,
  encNameIv: string,
) => {
  await db
    .update(directory)
    .set({ encName: { ciphertext: encName, iv: encNameIv } })
    .where(and(eq(directory.userId, userId), eq(directory.id, directoryId)))
    .execute();
};

export const unregisterDirectory = async (userId: number, directoryId: number) => {
  return await db.transaction(async (tx) => {
    const getFilePaths = async (parentId: number) => {
      const files = await tx
        .select({ path: file.path })
        .from(file)
        .where(and(eq(file.userId, userId), eq(file.parentId, parentId)));
      return files.map(({ path }) => path);
    };
    const unregisterSubDirectoriesRecursively = async (directoryId: number): Promise<string[]> => {
      const subDirectories = await tx
        .select({ id: directory.id })
        .from(directory)
        .where(and(eq(directory.userId, userId), eq(directory.parentId, directoryId)));
      const subDirectoryFilePaths = await Promise.all(
        subDirectories.map(async ({ id }) => await unregisterSubDirectoriesRecursively(id)),
      );
      const filePaths = await getFilePaths(directoryId);

      await tx.delete(file).where(eq(file.parentId, directoryId));
      await tx.delete(directory).where(eq(directory.id, directoryId));

      return filePaths.concat(...subDirectoryFilePaths);
    };
    return await unregisterSubDirectoriesRecursively(directoryId);
  });
};

export const registerNewFile = async (params: NewFileParams) => {
  await db.transaction(async (tx) => {
    const meks = await tx
      .select()
      .from(mek)
      .where(and(eq(mek.userId, params.userId), eq(mek.state, "active")));
    if (meks[0]?.version !== params.mekVersion) {
      throw new Error("Invalid MEK version");
    }

    const now = new Date();
    await tx.insert(file).values({
      path: params.path,
      parentId: params.parentId === "root" ? null : params.parentId,
      createdAt: now,
      userId: params.userId,
      mekVersion: params.mekVersion,
      encDek: params.encDek,
      encryptedAt: now,
      encContentIv: params.encContentIv,
      encName: { ciphertext: params.encName, iv: params.encNameIv },
    });
  });
};

export const getAllFilesByParent = async (userId: number, parentId: DirectroyId) => {
  return await db
    .select()
    .from(file)
    .where(
      and(
        eq(file.userId, userId),
        parentId === "root" ? isNull(file.parentId) : eq(file.parentId, parentId),
      ),
    )
    .execute();
};

export const getFile = async (userId: number, fileId: number) => {
  const res = await db
    .select()
    .from(file)
    .where(and(eq(file.userId, userId), eq(file.id, fileId)))
    .execute();
  return res[0] ?? null;
};

export const setFileEncName = async (
  userId: number,
  fileId: number,
  encName: string,
  encNameIv: string,
) => {
  await db
    .update(file)
    .set({ encName: { ciphertext: encName, iv: encNameIv } })
    .where(and(eq(file.userId, userId), eq(file.id, fileId)))
    .execute();
};

export const unregisterFile = async (userId: number, fileId: number) => {
  const res = await db
    .delete(file)
    .where(and(eq(file.userId, userId), eq(file.id, fileId)))
    .returning({ path: file.path })
    .execute();
  return res[0]?.path ?? null;
};
