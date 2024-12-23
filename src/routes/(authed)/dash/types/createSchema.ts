import { z } from 'zod';

export const createSchema = z.object({
	id: z.string(),
	name: z.string(),
	duration: z.number(),
	category: z.string(),
	rating: z.number()
});
export type CreateSchema = typeof createSchema;
