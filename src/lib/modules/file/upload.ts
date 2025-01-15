import axios from "axios";
import ExifReader from "exifreader";
import { limitFunction } from "p-limit";
import { writable, type Writable } from "svelte/store";
import {
  encodeToBase64,
  generateDataKey,
  wrapDataKey,
  encryptData,
  encryptString,
  signMessageHmac,
} from "$lib/modules/crypto";
import type {
  DuplicateFileScanRequest,
  DuplicateFileScanResponse,
  FileUploadRequest,
} from "$lib/server/schemas";
import {
  fileUploadStatusStore,
  type MasterKey,
  type HmacSecret,
  type FileUploadStatus,
} from "$lib/stores";

const requestDuplicateFileScan = limitFunction(
  async (file: File, hmacSecret: HmacSecret, onDuplicate: () => Promise<boolean>) => {
    const fileBuffer = await file.arrayBuffer();
    const fileSigned = encodeToBase64(await signMessageHmac(fileBuffer, hmacSecret.secret));

    const res = await axios.post("/api/file/scanDuplicates", {
      hskVersion: hmacSecret.version,
      contentHmac: fileSigned,
    } satisfies DuplicateFileScanRequest);
    const { files }: DuplicateFileScanResponse = res.data;

    if (files.length === 0 || (await onDuplicate())) {
      return { fileBuffer, fileSigned };
    } else {
      return {};
    }
  },
  { concurrency: 1 },
);

const getFileType = (file: File) => {
  if (file.type) return file.type;
  if (file.name.endsWith(".heic")) return "image/heic";
  throw new Error("Unknown file type");
};

const extractExifDateTime = (fileBuffer: ArrayBuffer) => {
  const exif = ExifReader.load(fileBuffer);
  const dateTimeOriginal = exif["DateTimeOriginal"]?.description;
  const offsetTimeOriginal = exif["OffsetTimeOriginal"]?.description;
  if (!dateTimeOriginal) return undefined;

  const [date, time] = dateTimeOriginal.split(" ");
  if (!date || !time) return undefined;

  const [year, month, day] = date.split(":").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);
  if (!year || !month || !day || !hour || !minute || !second) return undefined;

  if (!offsetTimeOriginal) {
    // No timezone information.. Assume local timezone
    return new Date(year, month - 1, day, hour, minute, second);
  }

  const offsetSign = offsetTimeOriginal[0] === "+" ? 1 : -1;
  const [offsetHour, offsetMinute] = offsetTimeOriginal.slice(1).split(":").map(Number);

  const utcDate = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetMs = offsetSign * ((offsetHour ?? 0) * 60 + (offsetMinute ?? 0)) * 60 * 1000;
  return new Date(utcDate - offsetMs);
};

const encryptFile = limitFunction(
  async (
    status: Writable<FileUploadStatus>,
    file: File,
    fileBuffer: ArrayBuffer,
    masterKey: MasterKey,
  ) => {
    status.update((value) => {
      value.status = "encrypting";
      return value;
    });

    const fileType = getFileType(file);

    let createdAt;
    if (fileType.startsWith("image/")) {
      createdAt = extractExifDateTime(fileBuffer);
    }

    const { dataKey, dataKeyVersion } = await generateDataKey();
    const dataKeyWrapped = await wrapDataKey(dataKey, masterKey.key);

    const fileEncrypted = await encryptData(fileBuffer, dataKey);
    const nameEncrypted = await encryptString(file.name, dataKey);
    const createdAtEncrypted =
      createdAt && (await encryptString(createdAt.getTime().toString(), dataKey));
    const lastModifiedAtEncrypted = await encryptString(file.lastModified.toString(), dataKey);

    status.update((value) => {
      value.status = "upload-pending";
      return value;
    });

    return {
      dataKeyWrapped,
      dataKeyVersion,
      fileEncrypted,
      fileType,
      nameEncrypted,
      createdAtEncrypted,
      lastModifiedAtEncrypted,
    };
  },
  { concurrency: 4 },
);

const uploadFileInternal = limitFunction(
  async (status: Writable<FileUploadStatus>, form: FormData) => {
    status.update((value) => {
      value.status = "uploading";
      return value;
    });

    await axios.post("/api/file/upload", form, {
      onUploadProgress: ({ progress, rate, estimated }) => {
        status.update((value) => {
          value.progress = progress;
          value.rate = rate;
          value.estimated = estimated;
          return value;
        });
      },
    });

    status.update((value) => {
      value.status = "uploaded";
      return value;
    });
  },
  { concurrency: 1 },
);

export const uploadFile = async (
  file: File,
  parentId: "root" | number,
  hmacSecret: HmacSecret,
  masterKey: MasterKey,
  onDuplicate: () => Promise<boolean>,
) => {
  const status = writable<FileUploadStatus>({
    name: file.name,
    parentId,
    status: "encryption-pending",
  });
  fileUploadStatusStore.update((value) => {
    value.push(status);
    return value;
  });

  try {
    const { fileBuffer, fileSigned } = await requestDuplicateFileScan(
      file,
      hmacSecret,
      onDuplicate,
    );
    if (!fileBuffer || !fileSigned) {
      status.update((value) => {
        value.status = "canceled";
        return value;
      });
      return false;
    }

    const {
      dataKeyWrapped,
      dataKeyVersion,
      fileEncrypted,
      fileType,
      nameEncrypted,
      createdAtEncrypted,
      lastModifiedAtEncrypted,
    } = await encryptFile(status, file, fileBuffer, masterKey);

    const form = new FormData();
    form.set(
      "metadata",
      JSON.stringify({
        parentId,
        mekVersion: masterKey.version,
        dek: dataKeyWrapped,
        dekVersion: dataKeyVersion.toISOString(),
        hskVersion: hmacSecret.version,
        contentHmac: fileSigned,
        contentType: fileType,
        contentIv: fileEncrypted.iv,
        name: nameEncrypted.ciphertext,
        nameIv: nameEncrypted.iv,
        createdAt: createdAtEncrypted?.ciphertext,
        createdAtIv: createdAtEncrypted?.iv,
        lastModifiedAt: lastModifiedAtEncrypted.ciphertext,
        lastModifiedAtIv: lastModifiedAtEncrypted.iv,
      } as FileUploadRequest),
    );
    form.set("content", new Blob([fileEncrypted.ciphertext]));

    await uploadFileInternal(status, form);
    return true;
  } catch (e) {
    status.update((value) => {
      value.status = "error";
      return value;
    });
    throw e;
  }
};
