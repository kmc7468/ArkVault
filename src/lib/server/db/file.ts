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
