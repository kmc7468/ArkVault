import { decryptData } from "$lib/modules/crypto";

export const requestFileDownload = (
  fileId: number,
  fileEncryptedIv: string,
  dataKey: CryptoKey,
) => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";

    xhr.addEventListener("load", async () => {
      if (xhr.status !== 200) {
        reject(new Error("Failed to download file"));
        return;
      }

      const fileDecrypted = await decryptData(
        xhr.response as ArrayBuffer,
        fileEncryptedIv,
        dataKey,
      );
      resolve(fileDecrypted);
    });

    // TODO: Progress, ...

    xhr.open("GET", `/api/file/${fileId}/download`);
    xhr.send();
  });
};
