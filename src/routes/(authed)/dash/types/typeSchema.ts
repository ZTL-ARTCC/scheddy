import { z } from 'zod';

export const typeSchema = z.object({
	name: z.string(),
	category: z.string(),
	length: z.coerce.number(),
	rating: z.coerce.number(),
	order: z.coerce.number(),
	bookable: z.boolean().default(true)
});
