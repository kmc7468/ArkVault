export const digestMessage = async (message: BufferSource) => {
  return await window.crypto.subtle.digest("SHA-256", message);
};

export const generateHmacSecret = async () => {
  return {
    hmacSecret: await window.crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: "SHA-256",
      } satisfies HmacKeyGenParams,
      true,
      ["sign", "verify"],
    ),
  };
};

export const signMessageHmac = async (message: BufferSource, hmacSecret: CryptoKey) => {
  return await window.crypto.subtle.sign("HMAC", hmacSecret, message);
};
