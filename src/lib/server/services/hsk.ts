import { error } from "@sveltejs/kit";
import { IntegrityError } from "$lib/server/db/error";
import { registerInitialHsk, getAllValidHsks } from "$lib/server/db/hsk";

export const getHskList = async (userId: number) => {
  const hsks = await getAllValidHsks(userId);
  return {
    encHsks: hsks.map(({ version, state, mekVersion, encHsk }) => ({
      version,
      state,
      mekVersion,
      encHsk,
    })),
  };
};

export const registerInitialActiveHsk = async (
  userId: number,
  createdBy: number,
  mekVersion: number,
  encHsk: string,
) => {
  try {
    await registerInitialHsk(userId, createdBy, mekVersion, encHsk);
  } catch (e) {
    if (e instanceof IntegrityError && e.message === "HSK already registered") {
      error(409, "Initial HSK already registered");
    }
    throw e;
  }
};
