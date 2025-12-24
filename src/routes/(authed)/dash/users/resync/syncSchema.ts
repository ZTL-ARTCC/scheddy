import { z } from 'zod';

export const syncSchema = z.object({
	id: z.coerce.number()
});

export type SetSchema = typeof syncSchema;
