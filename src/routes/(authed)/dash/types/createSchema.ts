import { z } from 'zod';

export const createSchema = z.object({
	name: z.string(),
	duration: z.number(),
	category: z.string(),
	order: z.number(),
	rating: z.number()
});
export type CreateSchema = typeof createSchema;
