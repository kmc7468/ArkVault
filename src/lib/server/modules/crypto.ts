import { error } from "@sveltejs/kit";
import { constants, randomBytes, createPublicKey, publicEncrypt, verify } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { getClient } from "$lib/server/db/client";

const makePubKeyToPem = (pubKey: string) =>
  `-----BEGIN PUBLIC KEY-----\n${pubKey}\n-----END PUBLIC KEY-----`;

export const verifyPubKey = (pubKey: string) => {
  const pubKeyPem = makePubKeyToPem(pubKey);
  const pubKeyObject = createPublicKey(pubKeyPem);
  return (
    pubKeyObject.asymmetricKeyType === "rsa" &&
    pubKeyObject.asymmetricKeyDetails?.modulusLength === 4096
  );
};

export const encryptAsymmetric = (data: Buffer, encPubKey: string) => {
  return publicEncrypt({ key: makePubKeyToPem(encPubKey), oaepHash: "sha256" }, data);
};

export const verifySignature = (data: Buffer, signature: string, sigPubKey: string) => {
  return verify(
    "rsa-sha256",
    data,
    {
      key: makePubKeyToPem(sigPubKey),
      padding: constants.RSA_PKCS1_PSS_PADDING,
    },
    Buffer.from(signature, "base64"),
  );
};

export const generateChallenge = async (length: number, encPubKey: string) => {
  const answer = await promisify(randomBytes)(length);
  const challenge = encryptAsymmetric(answer, encPubKey);
  return { answer, challenge };
};

export const parseSignedRequest = async <T extends z.ZodTypeAny>(
  clientId: number,
  data: unknown,
  schema: T,
) => {
  const zodRes = z
    .object({
      data: schema,
      signature: z.string().base64().nonempty(),
    })
    .safeParse(data);
  if (!zodRes.success) error(400, "Invalid request body");

  const { data: parsedData, signature } = zodRes.data;
  if (!parsedData) error(500, "Invalid request body");

  const client = await getClient(clientId);
  if (!client) {
    error(500, "Invalid access token");
  } else if (
    !verifySignature(Buffer.from(JSON.stringify(parsedData)), signature, client.sigPubKey)
  ) {
    error(400, "Invalid signature");
  }

  return parsedData;
};
