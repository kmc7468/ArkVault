import { error } from "@sveltejs/kit";
import { unlink } from "fs/promises";
import {
  getAllDirectoriesByParent,
  registerNewDirectory,
  getDirectory,
  setDirectoryEncName,
  unregisterDirectory,
  getAllFilesByParent,
  type NewDirectoryParams,
} from "$lib/server/db/file";
import { getActiveMekVersion } from "$lib/server/db/mek";

export const deleteDirectory = async (userId: number, directoryId: number) => {
  const directory = await getDirectory(userId, directoryId);
  if (!directory) {
    error(404, "Invalid directory id");
  }

  const filePaths = await unregisterDirectory(userId, directoryId);
  filePaths.map((path) => unlink(path)); // Intended
};

export const renameDirectory = async (
  userId: number,
  directoryId: number,
  dekVersion: Date,
  newEncName: string,
  newEncNameIv: string,
) => {
  const directory = await getDirectory(userId, directoryId);
  if (!directory) {
    error(404, "Invalid directory id");
  } else if (directory.dekVersion.getTime() !== dekVersion.getTime()) {
    error(400, "Invalid DEK version");
  }

  if (!(await setDirectoryEncName(userId, directoryId, dekVersion, newEncName, newEncNameIv))) {
    error(500, "Invalid directory id or DEK version");
  }
};

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

export const createDirectory = async (params: NewDirectoryParams) => {
  const activeMekVersion = await getActiveMekVersion(params.userId);
  if (activeMekVersion === null) {
    error(500, "Invalid MEK version");
  } else if (activeMekVersion !== params.mekVersion) {
    error(400, "Invalid MEK version");
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const oneMinuteLater = new Date(Date.now() + 60 * 1000);
  if (params.dekVersion <= oneMinuteAgo || params.dekVersion >= oneMinuteLater) {
    error(400, "Invalid DEK version");
  }

  await registerNewDirectory(params);
};
