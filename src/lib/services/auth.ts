import { encodeToBase64, decryptChallenge, signMessage } from "$lib/modules/crypto";
import type {
  TokenUpgradeRequest,
  TokenUpgradeResponse,
  TokenUpgradeVerifyRequest,
} from "$lib/server/schemas";

export const requestTokenUpgrade = async (
  encryptKeyBase64: string,
  decryptKey: CryptoKey,
  verifyKeyBase64: string,
  signKey: CryptoKey,
) => {
  let res = await fetch("/api/auth/upgradeToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      encPubKey: encryptKeyBase64,
      sigPubKey: verifyKeyBase64,
    } satisfies TokenUpgradeRequest),
  });
  if (!res.ok) return false;

  const { challenge }: TokenUpgradeResponse = await res.json();
  const answer = await decryptChallenge(challenge, decryptKey);
  const answerSig = await signMessage(answer, signKey);

  res = await fetch("/api/auth/upgradeToken/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer: encodeToBase64(answer),
      answerSig: encodeToBase64(answerSig),
    } satisfies TokenUpgradeVerifyRequest),
  });
  return res.ok;
};
