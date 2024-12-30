import { getRSAKey } from "$lib/indexedDB";
import { keyPairsStore } from "$lib/stores";

export const prepareKeyPairStores = async () => {
  const encPubKey = await getRSAKey("encrypt");
  const encPrivKey = await getRSAKey("decrypt");
  const sigPubKey = await getRSAKey("verify");
  const sigPrivKey = await getRSAKey("sign");
  if (encPubKey && encPrivKey && sigPubKey && sigPrivKey) {
    keyPairsStore.set({
      encKeyPair: { publicKey: encPubKey, privateKey: encPrivKey },
      sigKeyPair: { publicKey: sigPubKey, privateKey: sigPrivKey },
    });
    return true;
  } else {
    return false;
  }
};
