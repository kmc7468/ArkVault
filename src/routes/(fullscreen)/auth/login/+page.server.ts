import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const redirectPath = url.searchParams.get("redirect") || "/";

  const accessToken = cookies.get("accessToken");
  if (accessToken) {
    redirect(302, redirectPath);
  }

  return { redirectPath };
};
