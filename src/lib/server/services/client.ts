import { error } from "@sveltejs/kit";
import ms from "ms";
import {
  createClient,
  getClient,
  getClientByPubKeys,
  countClientByPubKey,
  createUserClient,
  getAllUserClients,
  getUserClient,
  setUserClientStateToPending,
  registerUserClientChallenge,
  getUserClientChallenge,
  markUserClientChallengeAsUsed,
} from "$lib/server/db/client";
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

const expiresIn = ms(env.challenge.userClientExp);
const expiresAt = () => new Date(Date.now() + expiresIn);

const createUserClientChallenge = async (
  userId: number,
  ip: string,
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
  let clientId;

  const client = await getClientByPubKeys(encPubKey, sigPubKey);
  if (client) {
    const userClient = await getUserClient(userId, client.id);
    if (userClient) {
      error(409, "Client already registered");
    }

    await createUserClient(userId, client.id);
    clientId = client.id;
  } else {
    if (!verifyPubKey(encPubKey) || !verifyPubKey(sigPubKey)) {
      error(400, "Invalid public key(s)");
    } else if (encPubKey === sigPubKey) {
      error(400, "Public keys must be different");
    } else if (
      (await countClientByPubKey(encPubKey)) > 0 ||
      (await countClientByPubKey(sigPubKey)) > 0
    ) {
      error(409, "Public key(s) already registered");
    }

    clientId = await createClient(encPubKey, sigPubKey, userId);
  }

  return { challenge: await createUserClientChallenge(userId, ip, clientId, encPubKey) };
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

export const verifyUserClient = async (
  userId: number,
  ip: string,
  answer: string,
  answerSig: string,
) => {
  const challenge = await getUserClientChallenge(answer, ip);
  if (!challenge) {
    error(401, "Invalid challenge answer");
  } else if (challenge.userId !== userId) {
    error(403, "Forbidden");
  }

  const client = await getClient(challenge.clientId);
  if (!client) {
    error(500, "Invalid challenge answer");
  } else if (!verifySignature(Buffer.from(answer, "base64"), answerSig, client.sigPubKey)) {
    error(401, "Invalid challenge answer signature");
  }

  await markUserClientChallengeAsUsed(challenge.id);
  await setUserClientStateToPending(userId, challenge.clientId);
};
