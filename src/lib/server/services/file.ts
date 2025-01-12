import { error } from "@sveltejs/kit";
import { createReadStream, createWriteStream } from "fs";
import { mkdir, stat, unlink } from "fs/promises";
import { dirname } from "path";
import { Readable, Writable } from "stream";
import { v4 as uuidv4 } from "uuid";
import { IntegrityError } from "$lib/server/db/error";
import {
  registerFile,
  getFile,
  setFileEncName,
  unregisterFile,
  type NewFileParams,
} from "$lib/server/db/file";
import env from "$lib/server/loadenv";

export const getFileInformation = async (userId: number, fileId: number) => {
  const file = await getFile(userId, fileId);
  if (!file) {
    error(404, "Invalid file id");
  }

  return {
    mekVersion: file.mekVersion,
    encDek: file.encDek,
    dekVersion: file.dekVersion,
    contentType: file.contentType,
    encContentIv: file.encContentIv,
    encName: file.encName,
  };
};

export const deleteFile = async (userId: number, fileId: number) => {
  try {
    const filePath = await unregisterFile(userId, fileId);
    unlink(filePath); // Intended
  } catch (e) {
    if (e instanceof IntegrityError && e.message === "File not found") {
      error(404, "Invalid file id");
    }
    throw e;
  }
};

export const getFileStream = async (userId: number, fileId: number) => {
  const file = await getFile(userId, fileId);
  if (!file) {
    error(404, "Invalid file id");
  }

  const { size } = await stat(file.path);
  return {
    encContentStream: Readable.toWeb(createReadStream(file.path)),
    encContentSize: size,
  };
};

export const renameFile = async (
  userId: number,
  fileId: number,
  dekVersion: Date,
  newEncName: string,
  newEncNameIv: string,
) => {
  try {
    await setFileEncName(userId, fileId, dekVersion, newEncName, newEncNameIv);
  } catch (e) {
    if (e instanceof IntegrityError) {
      if (e.message === "File not found") {
        error(404, "Invalid file id");
      } else if (e.message === "Invalid DEK version") {
        error(400, "Invalid DEK version");
      }
    }
    throw e;
  }
};

const safeUnlink = async (path: string) => {
  await unlink(path).catch(console.error);
};

export const uploadFile = async (
  params: Omit<NewFileParams, "path">,
  encContentStream: ReadableStream<Uint8Array>,
) => {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const oneMinuteLater = new Date(Date.now() + 60 * 1000);
  if (params.dekVersion <= oneMinuteAgo || params.dekVersion >= oneMinuteLater) {
    error(400, "Invalid DEK version");
  }

  const path = `${env.libraryPath}/${params.userId}/${uuidv4()}`;
  await mkdir(dirname(path), { recursive: true });

  try {
    await encContentStream.pipeTo(
      Writable.toWeb(createWriteStream(path, { flags: "wx", mode: 0o600 })),
    );
    await registerFile({
      ...params,
      path,
    });
  } catch (e) {
    await safeUnlink(path);

    if (e instanceof IntegrityError) {
      if (e.message === "Inactive MEK version") {
        error(400, "Invalid MEK version");
      }
    }
    throw e;
  }
};
