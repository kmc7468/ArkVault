import { z } from "zod";

export const directroyEntriesResponse = z.object({
  metadata: z
    .object({
      createdAt: z.date(),
      mekVersion: z.number().int().positive(),
      dek: z.string().base64().nonempty(),
      dekIv: z.string().base64().nonempty(),
      name: z.string().base64().nonempty(),
      nameIv: z.string().base64().nonempty(),
    })
    .optional(),
  subDirectories: z.number().int().positive().array(),
  files: z.number().int().positive().array(),
});
export type DirectroyEntriesResponse = z.infer<typeof directroyEntriesResponse>;

export const directoryCreateRequest = z.object({
  parentId: z.union([z.enum(["root"]), z.number().int().positive()]),
  mekVersion: z.number().int().positive(),
  dek: z.string().base64().nonempty(),
  dekIv: z.string().base64().nonempty(),
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type DirectoryCreateRequest = z.infer<typeof directoryCreateRequest>;
