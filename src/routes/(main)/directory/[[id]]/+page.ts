import { error } from "@sveltejs/kit";
import { z } from "zod";
import { callGetApi } from "$lib/hooks";
import type { DirectoryInfoResponse, FileInfoResponse } from "$lib/server/schemas";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const zodRes = z
    .object({
      id: z.coerce.number().int().positive().optional(),
    })
    .safeParse(params);
  if (!zodRes.success) error(404, "Not found");
  const { id } = zodRes.data;

  const directoryId = id ? id : ("root" as const);
  const res = await callGetApi(`/api/directory/${directoryId}`, fetch);
  if (!res.ok) error(404, "Not found");

  const directoryInfo: DirectoryInfoResponse = await res.json();
  const subDirectoryInfos = await Promise.all(
    directoryInfo.subDirectories.map(async (subDirectoryId) => {
      const res = await callGetApi(`/api/directory/${subDirectoryId}`, fetch);
      if (!res.ok) error(500, "Internal server error");
      return {
        ...((await res.json()) as DirectoryInfoResponse),
        id: subDirectoryId,
      };
    }),
  );
  const fileInfos = await Promise.all(
    directoryInfo.files.map(async (fileId) => {
      const res = await callGetApi(`/api/file/${fileId}`, fetch);
      if (!res.ok) error(500, "Internal server error");
      return {
        ...((await res.json()) as FileInfoResponse),
        id: fileId,
      };
    }),
  );

  return {
    id: directoryId,
    metadata: directoryInfo.metadata,
    subDirectories: subDirectoryInfos,
    files: fileInfos,
  };
};
