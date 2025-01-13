let rootHandle: FileSystemDirectoryHandle | null = null;

export const prepareOpfs = async () => {
  rootHandle = await navigator.storage.getDirectory();
};

const getFileHandle = async (path: string, create = true) => {
  if (!rootHandle) {
    throw new Error("OPFS not prepared");
  } else if (path[0] !== "/") {
    throw new Error("Path must be absolute");
  }

  const parts = path.split("/");
  if (parts.length <= 1) {
    throw new Error("Invalid path");
  }

  try {
    let directoryHandle: FileSystemDirectoryHandle = rootHandle;

    for (const part of parts.slice(0, -1)) {
      if (!part) continue;
      directoryHandle = await directoryHandle.getDirectoryHandle(part, { create });
    }

    return directoryHandle.getFileHandle(parts[parts.length - 1]!, { create });
  } catch (e) {
    if (e instanceof DOMException && e.name === "NotFoundError") {
      return null;
    }
    throw e;
  }
};

export const readFileFromOpfs = async (path: string) => {
  const fileHandle = await getFileHandle(path, false);
  if (!fileHandle) return null;

  const file = await fileHandle.getFile();
  return await file.arrayBuffer();
};

export const writeFileToOpfs = async (path: string, data: ArrayBuffer) => {
  const fileHandle = await getFileHandle(path);
  const writable = await fileHandle!.createWritable();

  try {
    await writable.write(data);
  } finally {
    await writable.close();
  }
};
