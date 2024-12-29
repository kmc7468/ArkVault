import { error } from "@sveltejs/kit";
import { getAllUserClients } from "$lib/server/db/client";
import {
  getAllValidClientMeks,
  getActiveMek,
  registerActiveMek,
  type ClientMek,
} from "$lib/server/db/mek";

export const getClientMekList = async (userId: number, clientId: number) => {
  const clientMeks = await getAllValidClientMeks(userId, clientId);
  return {
    meks: clientMeks.map((clientMek) => ({
      version: clientMek.master_encryption_key.version,
      state: clientMek.master_encryption_key.state,
      mek: clientMek.client_master_encryption_key.encMek,
    })),
  };
};

export const registerNewActiveMek = async (
  userId: number,
  createdBy: number,
  clientMeks: ClientMek[],
) => {
  const userClients = await getAllUserClients(userId);
  const activeUserClients = userClients.filter(({ state }) => state === "active");
  if (
    clientMeks.length !== activeUserClients.length ||
    !clientMeks.every((clientMek) =>
      activeUserClients.some((userClient) => userClient.clientId === clientMek.clientId),
    )
  ) {
    error(400, "Invalid key list");
  }

  const oldActiveMek = await getActiveMek(userId);
  const newMekVersion = (oldActiveMek?.version ?? 0) + 1;
  await registerActiveMek(userId, newMekVersion, createdBy, clientMeks);
};
