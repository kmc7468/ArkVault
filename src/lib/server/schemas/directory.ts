import { z } from "zod";

export const directoryRenameRequest = z.object({
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type DirectoryRenameRequest = z.infer<typeof directoryRenameRequest>;

export const directroyInfoResponse = z.object({
  metadata: z
    .object({
      createdAt: z.date(),
      mekVersion: z.number().int().positive(),
      dek: z.string().base64().nonempty(),
      name: z.string().base64().nonempty(),
      nameIv: z.string().base64().nonempty(),
    })
    .optional(),
  subDirectories: z.number().int().positive().array(),
  files: z.number().int().positive().array(),
});
export type DirectroyInfoResponse = z.infer<typeof directroyInfoResponse>;

export const directoryCreateRequest = z.object({
  parentId: z.union([z.enum(["root"]), z.number().int().positive()]),
  mekVersion: z.number().int().positive(),
  dek: z.string().base64().nonempty(),
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type DirectoryCreateRequest = z.infer<typeof directoryCreateRequest>;
