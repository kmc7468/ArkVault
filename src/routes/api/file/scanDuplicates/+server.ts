import { error, json } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import {
  duplicateFileScanRequest,
  duplicateFileScanResponse,
  type DuplicateFileScanResponse,
} from "$lib/server/schemas";
import { scanDuplicateFiles } from "$lib/server/services/file";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { userId } = await authorize(locals, "activeClient");

  const zodRes = duplicateFileScanRequest.safeParse(await request.json());
  if (!zodRes.success) error(400, "Invalid request body");
  const { hskVersion, contentHmac } = zodRes.data;

  const { files } = await scanDuplicateFiles(userId, hskVersion, contentHmac);
  return json(duplicateFileScanResponse.parse({ files } satisfies DuplicateFileScanResponse));
};
