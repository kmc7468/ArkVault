import { error } from "@sveltejs/kit";
import { unlink } from "fs/promises";
import { IntegrityError } from "$lib/server/db/error";
import {
  registerDirectory,
  getAllDirectoriesByParent,
  getDirectory,
  setDirectoryEncName,
  unregisterDirectory,
  getAllFilesByParent,
  type NewDirectoryParams,
} from "$lib/server/db/file";

export const getDirectoryInformation = async (userId: number, directoryId: "root" | number) => {
  const directory = directoryId !== "root" ? await getDirectory(userId, directoryId) : undefined;
  if (directory === null) {
    error(404, "Invalid directory id");
  }

  const directories = await getAllDirectoriesByParent(userId, directoryId);
  const files = await getAllFilesByParent(userId, directoryId);

  return {
    metadata: directory && {
      createdAt: directory.createdAt,
      mekVersion: directory.mekVersion,
      encDek: directory.encDek,
      dekVersion: directory.dekVersion,
      encName: directory.encName,
    },
    directories: directories.map(({ id }) => id),
    files: files.map(({ id }) => id),
  };
};

export const deleteDirectory = async (userId: number, directoryId: number) => {
  try {
    const filePaths = await unregisterDirectory(userId, directoryId);
    filePaths.map((path) => unlink(path)); // Intended
  } catch (e) {
    if (e instanceof IntegrityError && e.message === "Directory not found") {
      error(404, "Invalid directory id");
    }
    throw e;
  }
};

export const renameDirectory = async (
  userId: number,
  directoryId: number,
  dekVersion: Date,
  newEncName: string,
  newEncNameIv: string,
) => {
  try {
    await setDirectoryEncName(userId, directoryId, dekVersion, newEncName, newEncNameIv);
  } catch (e) {
    if (e instanceof IntegrityError) {
      if (e.message === "Directory not found") {
        error(404, "Invalid directory id");
      } else if (e.message === "Invalid DEK version") {
        error(400, "Invalid DEK version");
      }
    }
    throw e;
  }
};

export const createDirectory = async (params: NewDirectoryParams) => {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const oneMinuteLater = new Date(Date.now() + 60 * 1000);
  if (params.dekVersion <= oneMinuteAgo || params.dekVersion >= oneMinuteLater) {
    error(400, "Invalid DEK version");
  }

  try {
    await registerDirectory(params);
  } catch (e) {
    if (e instanceof IntegrityError && e.message === "Inactive MEK version") {
      error(400, "Invalid MEK version");
    }
    throw e;
  }
};
