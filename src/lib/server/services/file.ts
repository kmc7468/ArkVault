import { error } from "@sveltejs/kit";
import { createHash } from "crypto";
import { createReadStream, createWriteStream, ReadStream, WriteStream } from "fs";
import { mkdir, stat, unlink } from "fs/promises";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";
import {
  registerNewFile,
  getFile,
  setFileEncName,
  unregisterFile,
  type NewFileParams,
} from "$lib/server/db/file";
import { getActiveMekVersion } from "$lib/server/db/mek";
import env from "$lib/server/loadenv";

export const deleteFile = async (userId: number, fileId: number) => {
  const file = await getFile(userId, fileId);
  if (!file) {
    error(404, "Invalid file id");
  }

  const path = await unregisterFile(userId, fileId);
  if (!path) {
    error(500, "Invalid file id");
  }

  unlink(path); // Intended
};

const convertToReadableStream = (readStream: ReadStream) => {
  return new ReadableStream<Uint8Array>({
    start: (controller) => {
      readStream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)));
      readStream.on("end", () => controller.close());
      readStream.on("error", (e) => controller.error(e));
    },
    cancel: () => {
      readStream.destroy();
    },
  });
};

export const getFileStream = async (userId: number, fileId: number) => {
  const file = await getFile(userId, fileId);
  if (!file) {
    error(404, "Invalid file id");
  }

  const { size } = await stat(file.path);
  return {
    encContentStream: convertToReadableStream(createReadStream(file.path)),
    encContentSize: size,
  };
};

export const renameFile = async (
  userId: number,
  fileId: number,
  newEncName: string,
  newEncNameIv: string,
) => {
  const file = await getFile(userId, fileId);
  if (!file) {
    error(404, "Invalid file id");
  }

  await setFileEncName(userId, fileId, newEncName, newEncNameIv);
};

export const getFileInformation = async (userId: number, fileId: number) => {
  const file = await getFile(userId, fileId);
  if (!file) {
    error(404, "Invalid file id");
  }

  return {
    createdAt: file.createdAt,
    mekVersion: file.mekVersion,
    encDek: file.encDek,
    encContentIv: file.encContentIv,
    encName: file.encName,
  };
};

const convertToWritableStream = (writeStream: WriteStream) => {
  return new WritableStream<Uint8Array>({
    write: (chunk) =>
      new Promise((resolve, reject) => {
        writeStream.write(chunk, (e) => {
          if (e) {
            reject(e);
          } else {
            resolve();
          }
        });
      }),
    close: () => new Promise((resolve) => writeStream.end(resolve)),
  });
};

const safeUnlink = async (path: string) => {
  await unlink(path).catch(console.error);
};

export const uploadFile = async (
  params: Omit<NewFileParams, "path">,
  encContentStream: ReadableStream<Uint8Array>,
  encContentHash: string,
) => {
  const activeMekVersion = await getActiveMekVersion(params.userId);
  if (activeMekVersion === null) {
    error(500, "Invalid MEK version");
  } else if (activeMekVersion !== params.mekVersion) {
    error(400, "Invalid MEK version");
  }

  const path = `${env.libraryPath}/${params.userId}/${uuidv4()}`;
  const hash = createHash("sha256");

  await mkdir(dirname(path), { recursive: true });

  try {
    const hashStream = new TransformStream<Uint8Array, Uint8Array>({
      transform: (chunk, controller) => {
        hash.update(chunk);
        controller.enqueue(chunk);
      },
    });
    const fileStream = convertToWritableStream(
      createWriteStream(path, { flags: "wx", mode: 0o600 }),
    );
    await encContentStream.pipeThrough(hashStream).pipeTo(fileStream);
  } catch (e) {
    await safeUnlink(path);
    throw e;
  }

  if (hash.digest("base64") !== encContentHash) {
    await safeUnlink(path);
    error(400, "Invalid content hash");
  }

  try {
    await registerNewFile({
      ...params,
      path,
    });
  } catch (e) {
    await safeUnlink(path);
    throw e;
  }
};
