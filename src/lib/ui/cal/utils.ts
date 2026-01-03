import type { sessions, users, sessionTypes } from '$lib/server/db/schema';
import { DateTime } from 'luxon';

export const findHeight = (selectedDateISO: string, start: DateTime, end: DateTime) => {
	const crossesMidnight = start.toISODate() !== end.toISODate();
	let height = 0;

	if (crossesMidnight) {
		const midnight = start.endOf('day');

		if (start.toISODate() === selectedDateISO) {
			const minutesUntilMidnight = midnight.diff(start, 'minutes').minutes;
			height = minutesUntilMidnight * 0.1;
		} else if (end.toISODate() === selectedDateISO) {
			const minutesAfterMidnight = end.diff(end.startOf('day'), 'minutes').minutes;
			height = minutesAfterMidnight * 0.1;
		}
	} else {
		const diff = end.diff(start, 'minutes').minutes;
		height = diff * 0.1;
	}

	return height;
};

export const findMargin = (selectedDateISO: string, start: DateTime) => {
	const startOfToday = DateTime.fromISO(selectedDateISO).startOf('day');
	if (start < startOfToday) return 0;

	const diff = start.diff(start.startOf('day'), 'minutes').minutes;
	return Math.abs(diff * 0.1);
};

export const backgroundColors = [
	'#991b1b',
	'#155e75',
	'#9a3412',
	'#3730a3',
	'#854d0e',
	'#6b21a8',
	'#3f6212',
	'#9d174d',
	'#065f46',
	'#92400e',
	'#1e40af',
	'#166534',
	'#86198f',
	'#115e59',
	'#9f1239',
	'#075985',
	'#5b21b6'
];

export interface Session {
	student: typeof users.$inferSelect;
	mentor: typeof users.$inferSelect;
	session: typeof sessions.$inferSelect;
	sessionType: typeof sessionTypes.$inferSelect;
}

export interface SessionWithTime extends Session {
	start: DateTime;
	end: DateTime;
	column?: number;
}

export interface StyledSession extends SessionWithTime {
	style: string;
}
