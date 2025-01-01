import { exportRSAKeyToBase64 } from "$lib/modules/crypto";
import type { LoginRequest } from "$lib/server/schemas";
import { requestTokenUpgrade as requestTokenUpgradeInternal } from "$lib/services/auth";
import { requestClientRegistration } from "$lib/services/key";
import type { ClientKeys } from "$lib/stores";

export { requestMasterKeyDownload } from "$lib/services/key";

export const requestLogin = async (email: string, password: string) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password } satisfies LoginRequest),
  });
  return res.ok;
};

export const requestTokenUpgrade = async ({
  encryptKey,
  decryptKey,
  signKey,
  verifyKey,
}: ClientKeys) => {
  const encryptKeyBase64 = await exportRSAKeyToBase64(encryptKey);
  const verifyKeyBase64 = await exportRSAKeyToBase64(verifyKey);
  if (await requestTokenUpgradeInternal(encryptKeyBase64, decryptKey, verifyKeyBase64, signKey)) {
    return true;
  }

  if (await requestClientRegistration(encryptKeyBase64, decryptKey, verifyKeyBase64, signKey)) {
    return await requestTokenUpgradeInternal(
      encryptKeyBase64,
      decryptKey,
      verifyKeyBase64,
      signKey,
    );
  } else {
    return false;
  }
};
