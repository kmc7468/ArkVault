import mime from "mime";
import { z } from "zod";

export const fileRenameRequest = z.object({
  dekVersion: z.coerce.date(),
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type FileRenameRequest = z.infer<typeof fileRenameRequest>;

export const fileInfoResponse = z.object({
  createdAt: z.date(),
  mekVersion: z.number().int().positive(),
  dek: z.string().base64().nonempty(),
  dekVersion: z.date(),
  contentType: z
    .string()
    .nonempty()
    .refine((value) => mime.getExtension(value) !== null), // MIME type
  contentIv: z.string().base64().nonempty(),
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type FileInfoResponse = z.infer<typeof fileInfoResponse>;

export const fileUploadRequest = z.object({
  parentId: z.union([z.enum(["root"]), z.number().int().positive()]),
  mekVersion: z.number().int().positive(),
  dek: z.string().base64().nonempty(),
  dekVersion: z.coerce.date(),
  contentType: z
    .string()
    .nonempty()
    .refine((value) => mime.getExtension(value) !== null), // MIME type
  contentIv: z.string().base64().nonempty(),
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type FileUploadRequest = z.infer<typeof fileUploadRequest>;
