export const encodeToBase64 = (data: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};

export const decodeFromBase64 = (data: string) => {
  return Uint8Array.from(atob(data), (c) => c.charCodeAt(0)).buffer;
};

export const concatenateBuffers = (...buffers: ArrayBuffer[]) => {
  const arrays = buffers.map((buffer) => new Uint8Array(buffer));
  const totalLength = arrays.reduce((acc, array) => acc + array.length, 0);
  const result = new Uint8Array(totalLength);

  arrays.reduce((offset, array) => {
    result.set(array, offset);
    return offset + array.length;
  }, 0);
  return result;
};
