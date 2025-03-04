import { z } from 'zod';

export const setSchema = z.object({
	id: z.coerce.number(),
	roleOverride: z.coerce.number()
});

export type SetSchema = typeof setSchema;
