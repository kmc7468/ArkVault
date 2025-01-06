import { error } from "@sveltejs/kit";
import { z } from "zod";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const zodRes = z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .safeParse(params);
  if (!zodRes.success) error(404, "Not found");
  const { id } = zodRes.data;

  return { id };
};
