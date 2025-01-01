import { error } from "@sveltejs/kit";
import {
  getAllDirectoriesByParent,
  registerNewDirectory,
  getDirectory,
  getAllFilesByParent,
  type NewDirectroyParams,
} from "$lib/server/db/file";
import { getActiveMekVersion } from "$lib/server/db/mek";

export const getDirectroyInformation = async (userId: number, directroyId: "root" | number) => {
  const directory = directroyId !== "root" ? await getDirectory(userId, directroyId) : undefined;
  if (directory === null) {
    error(404, "Invalid directory id");
  }

  const directories = await getAllDirectoriesByParent(userId, directroyId);
  const files = await getAllFilesByParent(userId, directroyId);

  return {
    metadata: directory && {
      createdAt: directory.createdAt,
      mekVersion: directory.mekVersion,
      encDek: directory.encDek,
      encName: directory.encName,
    },
    directories: directories.map(({ id }) => id),
    files: files.map(({ id }) => id),
  };
};

export const createDirectory = async (params: NewDirectroyParams) => {
  const activeMekVersion = await getActiveMekVersion(params.userId);
  if (activeMekVersion === null) {
    error(500, "Invalid MEK version");
  } else if (activeMekVersion !== params.mekVersion) {
    error(400, "Invalid MEK version");
  }

  await registerNewDirectory(params);
};
