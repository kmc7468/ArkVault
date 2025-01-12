import { error } from "@sveltejs/kit";
import { getUser, setUserNickname } from "$lib/server/db/user";

export const getUserInformation = async (userId: number) => {
  const user = await getUser(userId);
  if (!user) {
    error(500, "Invalid session id");
  }

  return { email: user.email, nickname: user.nickname };
};

export const changeNickname = async (userId: number, nickname: string) => {
  await setUserNickname(userId, nickname);
};
