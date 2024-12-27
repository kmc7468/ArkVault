import { error } from "@sveltejs/kit";
import { createClient, getClientByPubKey } from "$lib/server/db/client";

export const registerPubKey = async (userId: number, pubKey: string) => {
  if (await getClientByPubKey(pubKey)) {
    error(409, "Public key already registered");
  }

  await createClient(pubKey, userId);
};
