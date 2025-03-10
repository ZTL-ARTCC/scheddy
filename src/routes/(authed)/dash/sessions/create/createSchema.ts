import { z } from 'zod';

export const createSchema = z.object({
	date: z.string().date(),
	hour: z.coerce.number(),
	minute: z.coerce.number(),
	type: z.string(),
	mentor: z.coerce.number(),
	student: z.coerce.number()
});
