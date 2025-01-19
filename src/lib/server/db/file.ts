import { SqliteError } from "better-sqlite3";
import { and, eq, isNull } from "drizzle-orm";
import db from "./drizzle";
import { IntegrityError } from "./error";
import { directory, directoryLog, file, fileLog, fileCategory, hsk, mek } from "./schema";

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
  hskVersion: number | null;
  contentHmac: string | null;
  contentType: string;
  encContentIv: string;
  encContentHash: string;
  encName: string;
  encNameIv: string;
  encCreatedAt: string | null;
  encCreatedAtIv: string | null;
  encLastModifiedAt: string;
  encLastModifiedAtIv: string;
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
        return await tx
          .delete(file)
          .where(and(eq(file.userId, userId), eq(file.parentId, parentId)))
          .returning({ id: file.id, path: file.path });
      };
      const unregisterDirectoryRecursively = async (
        directoryId: number,
      ): Promise<{ id: number; path: string }[]> => {
        const files = await unregisterFiles(directoryId);
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
        return files.concat(...subDirectoryFilePaths);
      };
      return await unregisterDirectoryRecursively(directoryId);
    },
    { behavior: "exclusive" },
  );
};

export const registerFile = async (params: NewFileParams) => {
  if (
    (params.hskVersion && !params.contentHmac) ||
    (!params.hskVersion && params.contentHmac) ||
    (params.encCreatedAt && !params.encCreatedAtIv) ||
    (!params.encCreatedAt && params.encCreatedAtIv)
  ) {
    throw new Error("Invalid arguments");
  }

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

      if (params.hskVersion) {
        const hsks = await tx
          .select({ version: hsk.version })
          .from(hsk)
          .where(and(eq(hsk.userId, params.userId), eq(hsk.state, "active")))
          .limit(1);
        if (hsks[0]?.version !== params.hskVersion) {
          throw new IntegrityError("Inactive HSK version");
        }
      }

      const newFiles = await tx
        .insert(file)
        .values({
          path: params.path,
          parentId: params.parentId === "root" ? null : params.parentId,
          userId: params.userId,
          mekVersion: params.mekVersion,
          hskVersion: params.hskVersion,
          encDek: params.encDek,
          dekVersion: params.dekVersion,
          contentHmac: params.contentHmac,
          contentType: params.contentType,
          encContentIv: params.encContentIv,
          encContentHash: params.encContentHash,
          encName: { ciphertext: params.encName, iv: params.encNameIv },
          encCreatedAt:
            params.encCreatedAt && params.encCreatedAtIv
              ? { ciphertext: params.encCreatedAt, iv: params.encCreatedAtIv }
              : null,
          encLastModifiedAt: {
            ciphertext: params.encLastModifiedAt,
            iv: params.encLastModifiedAtIv,
          },
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

export const getAllFilesByCategory = async (userId: number, categoryId: number) => {
  return await db
    .select()
    .from(file)
    .innerJoin(fileCategory, eq(file.id, fileCategory.fileId))
    .where(and(eq(file.userId, userId), eq(fileCategory.categoryId, categoryId)));
};

export const getAllFileIdsByContentHmac = async (
  userId: number,
  hskVersion: number,
  contentHmac: string,
) => {
  return await db
    .select({ id: file.id })
    .from(file)
    .where(
      and(
        eq(file.userId, userId),
        eq(file.hskVersion, hskVersion),
        eq(file.contentHmac, contentHmac),
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

export const addFileToCategory = async (fileId: number, categoryId: number) => {
  await db.transaction(
    async (tx) => {
      try {
        await tx.insert(fileCategory).values({ fileId, categoryId });
        await tx.insert(fileLog).values({
          fileId,
          timestamp: new Date(),
          action: "addToCategory",
          categoryId,
        });
      } catch (e) {
        if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
          throw new IntegrityError("File already added to category");
        }
        throw e;
      }
    },
    { behavior: "exclusive" },
  );
};

export const removeFileFromCategory = async (fileId: number, categoryId: number) => {
  await db.transaction(
    async (tx) => {
      const res = await tx
        .delete(fileCategory)
        .where(and(eq(fileCategory.fileId, fileId), eq(fileCategory.categoryId, categoryId)));
      if (res.changes === 0) {
        throw new IntegrityError("File not found in category");
      }

      await tx.insert(fileLog).values({
        fileId,
        timestamp: new Date(),
        action: "removeFromCategory",
        categoryId,
      });
    },
    { behavior: "exclusive" },
  );
};
