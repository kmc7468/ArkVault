import { callAPI } from "$lib/hooks";
import { storeMasterKeys } from "$lib/indexedDB";
import {
  encodeToBase64,
  decodeFromBase64,
  decryptRSACiphertext,
  signRSAMessage,
  makeAESKeyNonextractable,
  unwrapAESKeyUsingRSA,
  verifyMasterKeyWrappedSig,
} from "$lib/modules/crypto";
import { masterKeyStore } from "$lib/stores";

export const requestClientRegistration = async (
  encryptKeyBase64: string,
  decryptKey: CryptoKey,
  verifyKeyBase64: string,
  signKey: CryptoKey,
) => {
  let res = await callAPI("/api/client/register", {
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

  res = await callAPI("/api/client/register/verify", {
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

export const requestMasterKeyDownload = async (decryptKey: CryptoKey, verfiyKey: CryptoKey) => {
  const res = await callAPI("/api/mek/list", { method: "GET" });
  if (!res.ok) return false;

  const data = await res.json();
  const { meks: masterKeysWrapped } = data as {
    meks: {
      version: number;
      state: "active" | "retired";
      mek: string;
      mekSig: string;
    }[];
  };

  const masterKeys = await Promise.all(
    masterKeysWrapped.map(
      async ({ version, state, mek: masterKeyWrapped, mekSig: masterKeyWrappedSig }) => ({
        version,
        state,
        masterKey: await makeAESKeyNonextractable(
          await unwrapAESKeyUsingRSA(decodeFromBase64(masterKeyWrapped), decryptKey),
        ),
        isValid: await verifyMasterKeyWrappedSig(
          version,
          masterKeyWrapped,
          masterKeyWrappedSig,
          verfiyKey,
        ),
      }),
    ),
  );
  if (!masterKeys.every(({ isValid }) => isValid)) return false;

  await storeMasterKeys(
    masterKeys.map(({ version, state, masterKey }) => ({ version, state, key: masterKey })),
  );
  masterKeyStore.set(
    new Map(masterKeys.map(({ version, state, masterKey }) => [version, { state, masterKey }])),
  );

  return true;
};
