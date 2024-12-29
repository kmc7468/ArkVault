import { getInitialMek } from "$lib/server/db/mek";

export const isInitialMekNeeded = async (userId: number) => {
  const initialMek = await getInitialMek(userId);
  return !initialMek;
};
