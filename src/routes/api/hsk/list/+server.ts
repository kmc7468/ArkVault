import { json } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { hmacSecretListResponse, type HmacSecretListResponse } from "$lib/server/schemas";
import { getHskList } from "$lib/server/services/hsk";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  const { userId } = await authorize(locals, "activeClient");
  const { encHsks } = await getHskList(userId);
  return json(
    hmacSecretListResponse.parse({
      hsks: encHsks.map(({ version, state, mekVersion, encHsk }) => ({
        version,
        state,
        mekVersion,
        hsk: encHsk,
      })),
    } satisfies HmacSecretListResponse),
  );
};
