import { error } from "@sveltejs/kit";
import { z } from "zod";
import type { DirectroyInfoResponse } from "$lib/server/schemas";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const zodRes = z
    .object({
      id: z.coerce.number().int().positive().optional(),
    })
    .safeParse(params);
  if (!zodRes.success) error(404, "Not found");
  const { id } = zodRes.data;

  const directoryId = id ? id : ("root" as const);
  const res = await fetch(`/api/directory/${directoryId}`);
  if (!res.ok) error(404, "Not found");

  const directoryInfo: DirectroyInfoResponse = await res.json();
  const subDirectoryInfos = await Promise.all(
    directoryInfo.subDirectories.map(async (subDirectoryId) => {
      const res = await fetch(`/api/directory/${subDirectoryId}`);
      if (!res.ok) error(500, "Internal server error");
      return (await res.json()) as DirectroyInfoResponse;
    }),
  );
  const fileInfos = directoryInfo.files; // TODO

  return {
    id: directoryId,
    metadata: directoryInfo.metadata,
    subDirectories: subDirectoryInfos,
    files: fileInfos,
  };
};
