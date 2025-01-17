import { Dexie, type EntityTable } from "dexie";

export type DirectoryId = "root" | number;

interface DirectoryInfo {
  id: number;
  parentId: DirectoryId;
  name: string;
}

interface FileInfo {
  id: number;
  parentId: DirectoryId;
  name: string;
  contentType: string;
  createdAt?: Date;
  lastModifiedAt: Date;
}

const filesystem = new Dexie("filesystem") as Dexie & {
  directory: EntityTable<DirectoryInfo, "id">;
  file: EntityTable<FileInfo, "id">;
};

filesystem.version(1).stores({
  directory: "id, parentId",
  file: "id, parentId",
});

export const getDirectoryInfos = async (parentId: DirectoryId) => {
  return await filesystem.directory.where({ parentId }).toArray();
};

export const getDirectoryInfo = async (id: number) => {
  return await filesystem.directory.get(id);
};

export const storeDirectoryInfo = async (directoryInfo: DirectoryInfo) => {
  await filesystem.directory.put(directoryInfo);
};

export const getFileInfos = async (parentId: DirectoryId) => {
  return await filesystem.file.where({ parentId }).toArray();
};

export const getFileInfo = async (id: number) => {
  return await filesystem.file.get(id);
};

export const storeFileInfo = async (fileInfo: FileInfo) => {
  await filesystem.file.put(fileInfo);
};
