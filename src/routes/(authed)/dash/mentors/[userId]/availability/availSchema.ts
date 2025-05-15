import { z } from 'zod';

export const time = z.object({
	hour: z.coerce.number().min(0).max(48),
	minute: z.coerce.number().min(0).max(59)
});

export const dayAvailability = z.object({
	available: z.coerce.boolean(),
	slots: z
		.object({
			start: time,
			end: time
		})
		.array()
		.default([
			{
				start: { hour: 0, minute: 0 },
				end: { hour: 0, minute: 0 }
			}
		])
});

export const exceptionAvailability = dayAvailability.extend({
	slots: z
		.object({
			available: z.coerce.boolean(),
			start: time,
			end: time
		})
		.array()
		.default([
			{
				available: false,
				start: { hour: 0, minute: 0 },
				end: { hour: 0, minute: 0 }
			}
		])
});

export const availSchema = z.object({
	timezone: z.string(),
	sunday: dayAvailability,
	monday: dayAvailability,
	tuesday: dayAvailability,
	wednesday: dayAvailability,
	thursday: dayAvailability,
	friday: dayAvailability,
	saturday: dayAvailability,
	exceptions: z.record(z.string(), exceptionAvailability)
});

export type DayAvailability = typeof dayAvailability;
export type ExceptionAvailability = typeof exceptionAvailability;
export type AvailSchema = typeof availSchema;
