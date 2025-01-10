import { error } from "@sveltejs/kit";
import {
  createClient,
  getClient,
  getClientByPubKeys,
  createUserClient,
  getAllUserClients,
  getUserClient,
  setUserClientStateToPending,
  registerUserClientChallenge,
  getUserClientChallenge,
  markUserClientChallengeAsUsed,
} from "$lib/server/db/client";
import { IntegrityError } from "$lib/server/db/error";
import { verifyPubKey, verifySignature, generateChallenge } from "$lib/server/modules/crypto";
import { isInitialMekNeeded } from "$lib/server/modules/mek";
import env from "$lib/server/loadenv";

export const getUserClientList = async (userId: number) => {
  const userClients = await getAllUserClients(userId);
  return {
    userClients: userClients.map(({ clientId, state }) => ({
      id: clientId,
      state: state as "pending" | "active",
    })),
  };
};

const expiresAt = () => new Date(Date.now() + env.challenge.userClientExp);

const createUserClientChallenge = async (
  ip: string,
  userId: number,
  clientId: number,
  encPubKey: string,
) => {
  const { answer, challenge } = await generateChallenge(32, encPubKey);
  await registerUserClientChallenge(userId, clientId, answer.toString("base64"), ip, expiresAt());
  return challenge.toString("base64");
};

export const registerUserClient = async (
  userId: number,
  ip: string,
  encPubKey: string,
  sigPubKey: string,
) => {
  const client = await getClientByPubKeys(encPubKey, sigPubKey);
  if (client) {
    try {
      await createUserClient(userId, client.id);
      return { challenge: await createUserClientChallenge(ip, userId, client.id, encPubKey) };
    } catch (e) {
      if (e instanceof IntegrityError && e.message === "User client already exists") {
        error(409, "Client already registered");
      }
      throw e;
    }
  } else {
    if (encPubKey === sigPubKey) {
      error(400, "Same public keys");
    } else if (!verifyPubKey(encPubKey) || !verifyPubKey(sigPubKey)) {
      error(400, "Invalid public key(s)");
    }

    try {
      const clientId = await createClient(encPubKey, sigPubKey, userId);
      return { challenge: await createUserClientChallenge(ip, userId, clientId, encPubKey) };
    } catch (e) {
      if (e instanceof IntegrityError && e.message === "Public key(s) already registered") {
        error(409, "Public key(s) already used");
      }
      throw e;
    }
  }
};

export const verifyUserClient = async (
  userId: number,
  ip: string,
  answer: string,
  answerSig: string,
) => {
  const challenge = await getUserClientChallenge(answer, ip);
  if (!challenge) {
    error(403, "Invalid challenge answer");
  } else if (challenge.userId !== userId) {
    error(403, "Forbidden");
  }

  await markUserClientChallengeAsUsed(challenge.id);

  const client = await getClient(challenge.clientId);
  if (!client) {
    error(500, "Invalid challenge answer");
  } else if (!verifySignature(Buffer.from(answer, "base64"), answerSig, client.sigPubKey)) {
    error(403, "Invalid challenge answer signature");
  }

  await setUserClientStateToPending(userId, challenge.clientId);
};

export const getUserClientStatus = async (userId: number, clientId: number) => {
  const userClient = await getUserClient(userId, clientId);
  if (!userClient) {
    error(500, "Invalid access token");
  }

  return {
    state: userClient.state as "pending" | "active",
    isInitialMekNeeded: await isInitialMekNeeded(userId),
  };
};
