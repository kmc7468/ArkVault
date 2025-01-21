import { z } from "zod";

export const categoryIdSchema = z.union([z.enum(["root"]), z.number().int().positive()]);

export const categoryInfoResponse = z.object({
  metadata: z
    .object({
      parent: categoryIdSchema,
      mekVersion: z.number().int().positive(),
      dek: z.string().base64().nonempty(),
      dekVersion: z.string().datetime(),
      name: z.string().base64().nonempty(),
      nameIv: z.string().base64().nonempty(),
    })
    .optional(),
  subCategories: z.number().int().positive().array(),
});
export type CategoryInfoResponse = z.infer<typeof categoryInfoResponse>;

export const categoryCreateRequest = z.object({
  parent: categoryIdSchema,
  mekVersion: z.number().int().positive(),
  dek: z.string().base64().nonempty(),
  dekVersion: z.string().datetime(),
  name: z.string().base64().nonempty(),
  nameIv: z.string().base64().nonempty(),
});
export type CategoryCreateRequest = z.infer<typeof categoryCreateRequest>;
