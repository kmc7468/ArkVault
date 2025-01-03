export const digestMessage = async (message: BufferSource) => {
  return await window.crypto.subtle.digest("SHA-256", message);
};
