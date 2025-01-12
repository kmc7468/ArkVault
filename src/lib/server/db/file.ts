import { and, eq, isNull } from "drizzle-orm";
import db from "./drizzle";
import { IntegrityError } from "./error";
import { directory, directoryLog, file, fileLog, mek } from "./schema";

type DirectoryId = "root" | number;

export interface NewDirectoryParams {
  parentId: DirectoryId;
  userId: number;
  mekVersion: number;
  encDek: string;
  dekVersion: Date;
  encName: string;
  encNameIv: string;
}

export interface NewFileParams {
  parentId: DirectoryId;
  userId: number;
  path: string;
  mekVersion: number;
  encDek: string;
  dekVersion: Date;
  contentType: string;
  encContentIv: string;
  encName: string;
  encNameIv: string;
}

export const registerDirectory = async (params: NewDirectoryParams) => {
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

      const newDirectories = await tx
        .insert(directory)
        .values({
          parentId: params.parentId === "root" ? null : params.parentId,
          userId: params.userId,
          mekVersion: params.mekVersion,
          encDek: params.encDek,
          dekVersion: params.dekVersion,
          encName: { ciphertext: params.encName, iv: params.encNameIv },
        })
        .returning({ id: directory.id });
      const { id: directoryId } = newDirectories[0]!;
      await tx.insert(directoryLog).values({
        directoryId,
        timestamp: new Date(),
        action: "create",
        newName: { ciphertext: params.encName, iv: params.encNameIv },
      });
    },
    { behavior: "exclusive" },
  );
};

export const getAllDirectoriesByParent = async (userId: number, parentId: DirectoryId) => {
  return await db
    .select()
    .from(directory)
    .where(
      and(
        eq(directory.userId, userId),
        parentId === "root" ? isNull(directory.parentId) : eq(directory.parentId, parentId),
      ),
    );
};

export const getDirectory = async (userId: number, directoryId: number) => {
  const res = await db
    .select()
    .from(directory)
    .where(and(eq(directory.userId, userId), eq(directory.id, directoryId)))
    .limit(1);
  return res[0] ?? null;
};

export const setDirectoryEncName = async (
  userId: number,
  directoryId: number,
  dekVersion: Date,
  encName: string,
  encNameIv: string,
) => {
  await db.transaction(
    async (tx) => {
      const directories = await tx
        .select({ version: directory.dekVersion })
        .from(directory)
        .where(and(eq(directory.userId, userId), eq(directory.id, directoryId)))
        .limit(1);
      if (!directories[0]) {
        throw new IntegrityError("Directory not found");
      } else if (directories[0].version.getTime() !== dekVersion.getTime()) {
        throw new IntegrityError("Invalid DEK version");
      }

      await tx
        .update(directory)
        .set({ encName: { ciphertext: encName, iv: encNameIv } })
        .where(and(eq(directory.userId, userId), eq(directory.id, directoryId)));
      await tx.insert(directoryLog).values({
        directoryId,
        timestamp: new Date(),
        action: "rename",
        newName: { ciphertext: encName, iv: encNameIv },
      });
    },
    { behavior: "exclusive" },
  );
};

export const unregisterDirectory = async (userId: number, directoryId: number) => {
  return await db.transaction(
    async (tx) => {
      const unregisterFiles = async (parentId: number) => {
        const files = await tx
          .delete(file)
          .where(and(eq(file.userId, userId), eq(file.parentId, parentId)))
          .returning({ path: file.path });
        return files.map(({ path }) => path);
      };
      const unregisterDirectoryRecursively = async (directoryId: number): Promise<string[]> => {
        const filePaths = await unregisterFiles(directoryId);
        const subDirectories = await tx
          .select({ id: directory.id })
          .from(directory)
          .where(and(eq(directory.userId, userId), eq(directory.parentId, directoryId)));
        const subDirectoryFilePaths = await Promise.all(
          subDirectories.map(async ({ id }) => await unregisterDirectoryRecursively(id)),
        );

        const deleteRes = await tx.delete(directory).where(eq(directory.id, directoryId));
        if (deleteRes.changes === 0) {
          throw new IntegrityError("Directory not found");
        }
        return filePaths.concat(...subDirectoryFilePaths);
      };
      return await unregisterDirectoryRecursively(directoryId);
    },
    { behavior: "exclusive" },
  );
};

export const registerFile = async (params: NewFileParams) => {
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

      const newFiles = await tx
        .insert(file)
        .values({
          path: params.path,
          parentId: params.parentId === "root" ? null : params.parentId,
          userId: params.userId,
          mekVersion: params.mekVersion,
          contentType: params.contentType,
          encDek: params.encDek,
          dekVersion: params.dekVersion,
          encContentIv: params.encContentIv,
          encName: { ciphertext: params.encName, iv: params.encNameIv },
        })
        .returning({ id: file.id });
      const { id: fileId } = newFiles[0]!;
      await tx.insert(fileLog).values({
        fileId,
        timestamp: new Date(),
        action: "create",
        newName: { ciphertext: params.encName, iv: params.encNameIv },
      });
    },
    { behavior: "exclusive" },
  );
};

export const getAllFilesByParent = async (userId: number, parentId: DirectoryId) => {
  return await db
    .select()
    .from(file)
    .where(
      and(
        eq(file.userId, userId),
        parentId === "root" ? isNull(file.parentId) : eq(file.parentId, parentId),
      ),
    );
};

export const getFile = async (userId: number, fileId: number) => {
  const res = await db
    .select()
    .from(file)
    .where(and(eq(file.userId, userId), eq(file.id, fileId)))
    .limit(1);
  return res[0] ?? null;
};

export const setFileEncName = async (
  userId: number,
  fileId: number,
  dekVersion: Date,
  encName: string,
  encNameIv: string,
) => {
  await db.transaction(
    async (tx) => {
      const files = await tx
        .select({ version: file.dekVersion })
        .from(file)
        .where(and(eq(file.userId, userId), eq(file.id, fileId)))
        .limit(1);
      if (!files[0]) {
        throw new IntegrityError("File not found");
      } else if (files[0].version.getTime() !== dekVersion.getTime()) {
        throw new IntegrityError("Invalid DEK version");
      }

      await tx
        .update(file)
        .set({ encName: { ciphertext: encName, iv: encNameIv } })
        .where(and(eq(file.userId, userId), eq(file.id, fileId)));
      await tx.insert(fileLog).values({
        fileId,
        timestamp: new Date(),
        action: "rename",
        newName: { ciphertext: encName, iv: encNameIv },
      });
    },
    { behavior: "exclusive" },
  );
};

export const unregisterFile = async (userId: number, fileId: number) => {
  const files = await db
    .delete(file)
    .where(and(eq(file.userId, userId), eq(file.id, fileId)))
    .returning({ path: file.path });
  if (!files[0]) {
    throw new IntegrityError("File not found");
  }
  return files[0].path;
};
