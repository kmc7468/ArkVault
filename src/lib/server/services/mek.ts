import { error } from "@sveltejs/kit";
import { setUserClientStateToActive } from "$lib/server/db/client";
import { IntegrityError } from "$lib/server/db/error";
import { registerInitialMek, getAllValidClientMeks } from "$lib/server/db/mek";
import { verifyClientEncMekSig } from "$lib/server/modules/mek";

export const getClientMekList = async (userId: number, clientId: number) => {
  const clientMeks = await getAllValidClientMeks(userId, clientId);
  return {
    encMeks: clientMeks.map((clientMek) => ({
      version: clientMek.master_encryption_key.version,
      state: clientMek.master_encryption_key.state as "active" | "retired",
      encMek: clientMek.client_master_encryption_key.encMek,
      encMekSig: clientMek.client_master_encryption_key.encMekSig,
    })),
  };
};

export const registerInitialActiveMek = async (
  userId: number,
  createdBy: number,
  encMek: string,
  encMekSig: string,
) => {
  if (!(await verifyClientEncMekSig(userId, createdBy, 1, encMek, encMekSig))) {
    error(400, "Invalid signature");
  }

  try {
    await registerInitialMek(userId, createdBy, encMek, encMekSig);
    await setUserClientStateToActive(userId, createdBy);
  } catch (e) {
    if (e instanceof IntegrityError && e.message === "MEK already registered") {
      error(409, "Initial MEK already registered");
    }
    throw e;
  }
};
