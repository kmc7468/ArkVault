import { error } from "@sveltejs/kit";
import { randomBytes, publicEncrypt, createPublicKey } from "crypto";
import ms from "ms";
import { promisify } from "util";
import {
  createClient,
  getClientByPubKey,
  createUserClient,
  getAllUserClients,
  getUserClient,
  createUserClientChallenge,
  getUserClientChallenge,
  setUserClientStateToPending,
} from "$lib/server/db/client";
import { isInitialMekNeeded } from "$lib/server/modules/mek";
import env from "$lib/server/loadenv";

export const getUserClientList = async (userId: number) => {
  const userClients = await getAllUserClients(userId);
  return {
    userClients: userClients.map(({ clientId, state }) => ({
      id: clientId,
      state,
    })),
  };
};

const expiresIn = ms(env.challenge.pubKeyExp);
const expiresAt = () => new Date(Date.now() + expiresIn);

const generateChallenge = async (userId: number, ip: string, clientId: number, pubKey: string) => {
  const answer = await promisify(randomBytes)(32);
  const answerBase64 = answer.toString("base64");
  await createUserClientChallenge(userId, clientId, answerBase64, ip, expiresAt());

  const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${pubKey}\n-----END PUBLIC KEY-----`;
  const challenge = publicEncrypt({ key: pubKeyPem, oaepHash: "sha256" }, answer);
  return challenge.toString("base64");
};

export const registerUserClient = async (userId: number, ip: string, pubKey: string) => {
  const client = await getClientByPubKey(pubKey);
  let clientId;

  if (client) {
    const userClient = await getUserClient(userId, client.id);
    if (userClient) {
      error(409, "Public key already registered");
    }

    await createUserClient(userId, client.id);
    clientId = client.id;
  } else {
    const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${pubKey}\n-----END PUBLIC KEY-----`;
    const pubKeyObject = createPublicKey(pubKeyPem);
    if (
      pubKeyObject.asymmetricKeyType !== "rsa" ||
      pubKeyObject.asymmetricKeyDetails?.modulusLength !== 4096
    ) {
      error(400, "Invalid public key");
    }

    clientId = await createClient(pubKey, userId);
  }

  return await generateChallenge(userId, ip, clientId, pubKey);
};

export const getUserClientStatus = async (userId: number, clientId: number) => {
  const userClient = await getUserClient(userId, clientId);
  if (!userClient) {
    error(500, "Invalid access token");
  }

  return {
    state: userClient.state,
    isInitialMekNeeded: await isInitialMekNeeded(userId),
  };
};

export const verifyUserClient = async (userId: number, ip: string, answer: string) => {
  const challenge = await getUserClientChallenge(answer, ip);
  if (!challenge) {
    error(401, "Invalid challenge answer");
  } else if (challenge.userId !== userId) {
    error(403, "Forbidden");
  }

  await setUserClientStateToPending(userId, challenge.clientId);
};
