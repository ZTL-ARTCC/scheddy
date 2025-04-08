import { z } from 'zod';

export const transferSchema = z.object({
	targetMentor: z.coerce.number()
});
