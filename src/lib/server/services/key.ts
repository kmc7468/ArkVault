import { error } from "@sveltejs/kit";
import { randomBytes, publicEncrypt, createPublicKey } from "crypto";
import ms from "ms";
import { promisify } from "util";
import {
  createClient,
  getClientByPubKey,
  createUserClientChallenge,
  getUserClientChallenge,
  setUserClientStateToPending,
} from "$lib/server/db/client";
import env from "$lib/server/loadenv";

const expiresIn = ms(env.challenge.pubKeyExp);
const expiresAt = () => Date.now() + expiresIn;

const generateChallenge = async (userId: number, ip: string, clientId: number, pubKey: string) => {
  const challenge = await promisify(randomBytes)(32);
  const challengeBase64 = challenge.toString("base64");
  await createUserClientChallenge(userId, clientId, challengeBase64, ip, expiresAt());

  const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${pubKey}\n-----END PUBLIC KEY-----`;
  const challengeEncrypted = publicEncrypt({ key: pubKeyPem, oaepHash: "sha256" }, challenge);
  return challengeEncrypted.toString("base64");
};

export const registerPubKey = async (userId: number, ip: string, pubKey: string) => {
  if (await getClientByPubKey(pubKey)) {
    error(409, "Public key already registered");
  }

  const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${pubKey}\n-----END PUBLIC KEY-----`;
  const pubKeyObject = createPublicKey(pubKeyPem);
  if (
    pubKeyObject.asymmetricKeyType !== "rsa" ||
    pubKeyObject.asymmetricKeyDetails?.modulusLength !== 4096
  ) {
    error(400, "Invalid public key");
  }

  const clientId = await createClient(pubKey, userId);
  return await generateChallenge(userId, ip, clientId, pubKey);
};

export const verifyPubKey = async (userId: number, ip: string, answer: string) => {
  const challenge = await getUserClientChallenge(answer, ip);
  if (!challenge) {
    error(401, "Invalid challenge answer");
  } else if (challenge.userId !== userId) {
    error(403, "Forbidden");
  }

  await setUserClientStateToPending(userId, challenge.clientId);
};
