import { z } from "zod";

export const directoryInfoResponse = z.object({
  metadata: z
    .object({
      mekVersion: z.number().int().positive(),
      dek: z.string().base64().nonempty(),
      dekVersion: z.string().datetime(),
      name: z.string().base64().nonempty(),
      nameIv: z.string().base64().nonempty(),
    })
    .optional(),
  subDirectories: z.number().int().positive().array(),
  files: z.number().int().positive().array(),
});
export type DirectoryInfoResponse = z.infer<typeof directoryInfoResponse>;

export const directoryRenameRequest = z.object({
  dekVersion: z.string().datetime(),
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type DirectoryRenameRequest = z.infer<typeof directoryRenameRequest>;

export const directoryCreateRequest = z.object({
  parentId: z.union([z.enum(["root"]), z.number().int().positive()]),
  mekVersion: z.number().int().positive(),
  dek: z.string().base64().nonempty(),
  dekVersion: z.string().datetime(),
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type DirectoryCreateRequest = z.infer<typeof directoryCreateRequest>;
