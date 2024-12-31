import { exportRSAKey, digestSHA256 } from "$lib/modules/crypto";

export { requestMasterKeyDownload } from "$lib/services/key";

export const generateEncryptKeyFingerprint = async (encryptKey: CryptoKey) => {
  const { key } = await exportRSAKey(encryptKey);
  const digest = await digestSHA256(key);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .match(/.{1,4}/g)!
    .join(" ");
};
