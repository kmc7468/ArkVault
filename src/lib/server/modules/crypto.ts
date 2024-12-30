import { constants, randomBytes, createPublicKey, publicEncrypt, verify } from "crypto";
import { promisify } from "util";

const makePubKeyPem = (pubKey: string) =>
  `-----BEGIN PUBLIC KEY-----\n${pubKey}\n-----END PUBLIC KEY-----`;

export const verifyPubKey = (pubKey: string) => {
  const pubKeyPem = makePubKeyPem(pubKey);
  const pubKeyObject = createPublicKey(pubKeyPem);
  return (
    pubKeyObject.asymmetricKeyType === "rsa" &&
    pubKeyObject.asymmetricKeyDetails?.modulusLength === 4096
  );
};

export const encryptAsymmetric = (data: Buffer, encPubKey: string) => {
  return publicEncrypt({ key: makePubKeyPem(encPubKey), oaepHash: "sha256" }, data);
};

export const verifySignature = (data: string, signature: string, sigPubKey: string) => {
  return verify(
    "rsa-sha256",
    Buffer.from(data, "base64"),
    {
      key: makePubKeyPem(sigPubKey),
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
