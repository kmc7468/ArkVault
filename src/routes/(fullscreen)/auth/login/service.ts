import { exportRSAKeyToBase64 } from "$lib/modules/crypto";
import { requestTokenUpgrade as requestTokenUpgradeInternal } from "$lib/services/auth";
import { requestClientRegistration } from "$lib/services/key";

export const requestLogin = async (email: string, password: string) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return res.ok;
};

export const requestTokenUpgrade = async (encKeyPair: CryptoKeyPair, sigKeyPair: CryptoKeyPair) => {
  const encPubKeyBase64 = await exportRSAKeyToBase64(encKeyPair.publicKey, "public");
  const sigPubKeyBase64 = await exportRSAKeyToBase64(sigKeyPair.publicKey, "public");
  if (
    await requestTokenUpgradeInternal(
      encPubKeyBase64,
      encKeyPair.privateKey,
      sigPubKeyBase64,
      sigKeyPair.privateKey,
    )
  ) {
    return true;
  }

  if (
    await requestClientRegistration(
      encPubKeyBase64,
      encKeyPair.privateKey,
      sigPubKeyBase64,
      sigKeyPair.privateKey,
    )
  ) {
    return await requestTokenUpgradeInternal(
      encPubKeyBase64,
      encKeyPair.privateKey,
      sigPubKeyBase64,
      sigKeyPair.privateKey,
    );
  } else {
    return false;
  }
};
