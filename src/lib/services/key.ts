import { callGetApi, callPostApi } from "$lib/hooks";
import { storeMasterKeys } from "$lib/indexedDB";
import {
  encodeToBase64,
  decodeFromBase64,
  decryptRSACiphertext,
  signRSAMessage,
  makeAESKeyNonextractable,
  unwrapAESMasterKey,
  verifyMasterKeyWrappedSig,
} from "$lib/modules/crypto";
import type {
  ClientRegisterRequest,
  ClientRegisterResponse,
  ClientRegisterVerifyRequest,
  MasterKeyListResponse,
} from "$lib/server/schemas";
import { masterKeyStore } from "$lib/stores";

export const requestClientRegistration = async (
  encryptKeyBase64: string,
  decryptKey: CryptoKey,
  verifyKeyBase64: string,
  signKey: CryptoKey,
) => {
  let res = await callPostApi<ClientRegisterRequest>("/api/client/register", {
    encPubKey: encryptKeyBase64,
    sigPubKey: verifyKeyBase64,
  });
  if (!res.ok) return false;

  const { challenge }: ClientRegisterResponse = await res.json();
  const answer = await decryptRSACiphertext(decodeFromBase64(challenge), decryptKey);
  const sigAnswer = await signRSAMessage(answer, signKey);

  res = await callPostApi<ClientRegisterVerifyRequest>("/api/client/register/verify", {
    answer: encodeToBase64(answer),
    sigAnswer: encodeToBase64(sigAnswer),
  });
  return res.ok;
};

export const requestMasterKeyDownload = async (decryptKey: CryptoKey, verfiyKey: CryptoKey) => {
  const res = await callGetApi("/api/mek/list");
  if (!res.ok) return false;

  const { meks: masterKeysWrapped }: MasterKeyListResponse = await res.json();
  const masterKeys = await Promise.all(
    masterKeysWrapped.map(
      async ({ version, state, mek: masterKeyWrapped, mekSig: masterKeyWrappedSig }) => ({
        version,
        state,
        masterKey: await makeAESKeyNonextractable(
          await unwrapAESMasterKey(decodeFromBase64(masterKeyWrapped), decryptKey),
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
    new Map(
      masterKeys.map(({ version, state, masterKey }) => [
        version,
        { version, state, key: masterKey },
      ]),
    ),
  );

  return true;
};
