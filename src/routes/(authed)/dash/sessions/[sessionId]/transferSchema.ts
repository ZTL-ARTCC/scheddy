import { z } from 'zod';

export const transferSchema = z.object({
	newMentor: z.coerce.number()
});
