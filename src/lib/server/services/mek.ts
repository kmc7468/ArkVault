import { error } from "@sveltejs/kit";
import { getAllUserClients, getClient, setUserClientStateToActive } from "$lib/server/db/client";
import {
  getAllValidClientMeks,
  registerInitialMek,
  registerActiveMek,
  getNextActiveMekVersion,
} from "$lib/server/db/mek";
import { verifySignature } from "$lib/server/modules/crypto";
import { isInitialMekNeeded } from "$lib/server/modules/mek";

interface NewClientMek {
  clientId: number;
  encMek: string;
  sigEncMek: string;
}

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

export const registerInitialActiveMek = async (
  userId: number,
  createdBy: number,
  encMek: string,
  sigEncMek: string,
) => {
  if (!(await isInitialMekNeeded(userId))) {
    error(409, "Initial MEK already registered");
  }

  const client = await getClient(createdBy);
  if (!client) {
    error(500, "Invalid access token");
  } else if (!verifySignature(encMek, sigEncMek, client.sigPubKey)) {
    error(400, "Invalid signature");
  }

  await registerInitialMek(userId, createdBy, encMek);
  await setUserClientStateToActive(userId, createdBy);
};

export const registerNewActiveMek = async (
  userId: number,
  createdBy: number,
  clientMeks: NewClientMek[],
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

  const client = await getClient(createdBy);
  if (!client) {
    error(500, "Invalid access token");
  } else if (
    !clientMeks.every(({ encMek, sigEncMek }) =>
      verifySignature(encMek, sigEncMek, client.sigPubKey),
    )
  ) {
    error(400, "Invalid signature");
  }

  const newMekVersion = await getNextActiveMekVersion(userId);
  await registerActiveMek(userId, newMekVersion, createdBy, clientMeks);
};
