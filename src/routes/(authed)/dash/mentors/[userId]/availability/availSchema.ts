import { z } from 'zod';

export const time = z.object({
	hour: z.coerce.number().min(0).max(48),
	minute: z.coerce.number().min(0).max(59)
});

export const dayAvailability = z.object({
	available: z.coerce.boolean(),
	start: time,
	end: time,
	extraRecords: z
		.object({
			start: time,
			end: time
		})
		.array()
});
export type DayAvailability = typeof dayAvailability;

export const availSchema = z.object({
	timezone: z.string(),
	sunday: dayAvailability,
	monday: dayAvailability,
	tuesday: dayAvailability,
	wednesday: dayAvailability,
	thursday: dayAvailability,
	friday: dayAvailability,
	saturday: dayAvailability,
	exceptions: z.record(z.string(), dayAvailability)
});

export type AvailSchema = typeof availSchema;
