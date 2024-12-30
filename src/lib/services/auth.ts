import {
  encodeToBase64,
  decodeFromBase64,
  decryptRSACiphertext,
  signRSAMessage,
} from "$lib/modules/crypto";

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
    }),
  });
  if (!res.ok) return false;

  const { challenge } = await res.json();
  const answer = await decryptRSACiphertext(decodeFromBase64(challenge), decryptKey);
  const sigAnswer = await signRSAMessage(answer, signKey);

  res = await fetch("/api/auth/upgradeToken/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer: encodeToBase64(answer),
      sigAnswer: encodeToBase64(sigAnswer),
    }),
  });
  return res.ok;
};
