import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const redirectPath = url.searchParams.get("redirect") || "/home";

  if (locals.session) {
    redirect(302, redirectPath);
  }

  return { redirectPath };
};
