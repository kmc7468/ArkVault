import { error } from "@sveltejs/kit";
import { z } from "zod";
import { callGetApi } from "$lib/hooks";
import type { FileInfoResponse } from "$lib/server/schemas";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const zodRes = z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .safeParse(params);
  if (!zodRes.success) error(404, "Not found");
  const { id } = zodRes.data;

  const res = await callGetApi(`/api/file/${id}`, fetch);
  if (!res.ok) error(404, "Not found");

  const fileInfo: FileInfoResponse = await res.json();
  return {
    id,
    metadata: fileInfo,
  };
};
