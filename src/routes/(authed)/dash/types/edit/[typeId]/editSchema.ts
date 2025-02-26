import { z } from "zod";

export const editSchema = z.object({
	name: z.string(),
	category: z.string(),
	length: z.coerce.number(),
	rating: z.coerce.number(),
	order: z.coerce.number()
});