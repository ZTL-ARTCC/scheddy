import type { sessions, users, sessionTypes } from '$lib/server/db/schema';
import { DateTime, Interval } from 'luxon';

export interface Session {
	student: typeof users.$inferSelect;
	mentor: typeof users.$inferSelect;
	session: typeof sessions.$inferSelect;
	sessionType: typeof sessionTypes.$inferSelect;
}

export const findHeight = (start: DateTime, end: DateTime) => {
	const diffMinutes = end.diff(start, 'minutes').minutes;
	return diffMinutes * 0.1;
};

export const findMargin = (start: DateTime, slotStart: DateTime) => {
	const diff = start.diff(slotStart, 'minutes').minutes;
	return Math.abs(diff * 0.1);
};

export const assignLayers = (sessions: Session[]) => {
	const sorted = [...sessions].sort((a, b) => a.session.start.localeCompare(b.session.start));

	const layers: Session[][] = [];

	for (const session of sorted) {
		let placed = false;

		for (const layer of layers) {
			const hasOverlap = layer.some((s) => {
				const sInterval = Interval.fromDateTimes(
					DateTime.fromISO(s.session.start),
					DateTime.fromISO(s.session.start).plus({ minutes: s.sessionType.length })
				);
				const sessionInterval = Interval.fromDateTimes(
					DateTime.fromISO(session.session.start),
					DateTime.fromISO(session.session.start).plus({ minutes: session.sessionType.length })
				);

				return sInterval.overlaps(sessionInterval);
			});

			if (!hasOverlap) {
				layer.push(session);
				placed = true;
				break;
			}
		}

		if (!placed) {
			layers.push([session]);
		}
	}

	return layers;
};

export const findLayerOffset = (layer: number, totalLayers: number) => {
	const base = 50 / (1 - Math.pow(0.5, totalLayers));
	return base * (1 - Math.pow(0.5, layer));
};

export const backgroundColors = [
	'#991b1b',
	'#9a3412',
	'#92400e',
	'#854d0e',
	'#3f6212',
	'#166534',
	'#065f46',
	'#115e59',
	'#155e75',
	'#075985',
	'#1e40af',
	'#3730a3',
	'#5b21b6',
	'#6b21a8',
	'#86198f',
	'#9d174d',
	'#9f1239'
];
