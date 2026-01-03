import {
	type SessionWithTime,
	type StyledSession,
	type Session,
	findHeight,
	findMargin,
	backgroundColors
} from './utils';
import { DateTime } from 'luxon';

const styleCreator = (style: string[]): string => {
	return style.join(';\n');
};

const sortIntoGroups = (sessions: Session[]): SessionWithTime[][] => {
	const sessionWithTimes: SessionWithTime[] = sessions.map((s) => ({
		...s,
		start: DateTime.fromISO(s.session.start),
		end: DateTime.fromISO(s.session.start).plus({ minutes: s.sessionType.length })
	}));

	const groups: SessionWithTime[][] = [];
	let lastSessionEnd: number | null = null;

	sessionWithTimes.forEach((session) => {
		if (!lastSessionEnd || session.start.toMillis() >= lastSessionEnd) {
			groups.push([session]);
		} else {
			groups[groups.length - 1].push(session);
		}

		if (!lastSessionEnd || session.end.toMillis() > lastSessionEnd) {
			lastSessionEnd = session.end.toMillis();
		}
	});

	return groups;
};

export const getStyledSessions = (
	sessions: Session[],
	selectedDateISO: string
): StyledSession[] => {
	if (sessions.length === 0) return [];

	const sTypes = [...new Set(sessions.map((s) => s.sessionType.id))];

	const groups = sortIntoGroups(sessions);

	return groups.flatMap((group) => {
		const columns: SessionWithTime[][] = [];

		for (const session of group) {
			let placed = false;

			for (let i = 0; i < columns.length; i++) {
				const lastEvent = columns[i][columns[i].length - 1];
				if (session.start.toMillis() >= lastEvent.end.toMillis()) {
					columns[i].push(session);
					session.column = i;
					placed = true;
					break;
				}
			}

			if (!placed) {
				session.column = columns.length;
				columns.push([session]);
			}
		}

		return group.map((session): StyledSession => {
			const columnIndex = session.column!;
			const totalColumns = columns.length;

			let canSpan = 1;
			for (let i = columnIndex + 1; i < totalColumns; i++) {
				const hasOverlap = columns[i].some(
					(other) => session.start < other.end && session.end > other.start
				);
				if (hasOverlap) break;
				canSpan++;
			}

			const left = (columnIndex / totalColumns) * 95;
			const width = (95 / totalColumns) * canSpan;
			const actualWidth = columnIndex < totalColumns - 1 ? width * 1.7 : width;

			return {
				...session,
				style: styleCreator([
					`left: ${left}%`,
					`width: ${Math.min(actualWidth, 95 - left)}%`,
					`z-index: ${columnIndex}`,
					`height: ${findHeight(selectedDateISO, session.start, session.end)}rem`,
					`top: ${findMargin(selectedDateISO, session.start)}rem`,
					`background-color: ${backgroundColors[sTypes.indexOf(session.sessionType.id) % backgroundColors.length]}`
				])
			};
		});
	});
};
