import { json } from "@sveltejs/kit";
import { authorize } from "$lib/server/modules/auth";
import { masterKeyListResponse, type MasterKeyListResponse } from "$lib/server/schemas";
import { getClientMekList } from "$lib/server/services/mek";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies }) => {
  const { userId, clientId } = await authorize(cookies, "activeClient");
  const { encMeks } = await getClientMekList(userId, clientId);
  return json(
    masterKeyListResponse.parse({
      meks: encMeks.map(({ version, state, encMek, encMekSig }) => ({
        version,
        state,
        mek: encMek,
        mekSig: encMekSig,
      })),
    } satisfies MasterKeyListResponse),
  );
};
