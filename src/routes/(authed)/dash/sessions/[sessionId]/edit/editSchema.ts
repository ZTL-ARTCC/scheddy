import { z } from 'zod';

export const editSchema = z.object({
	date: z.string().date(),
	hour: z.coerce.number(),
	minute: z.coerce.number(),
	type: z.string(),
	mentor: z.coerce.number()
});
