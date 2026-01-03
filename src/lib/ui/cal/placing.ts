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
	const sorted: SessionWithTime[] = sessions
		.map((s) => ({
			...s,
			start: DateTime.fromISO(s.session.start),
			end: DateTime.fromISO(s.session.start).plus({ minutes: s.sessionType.length })
		}))
		.sort((a, b) => a.start.toMillis() - b.start.toMillis());

	const groups: SessionWithTime[][] = [];
	let lastEnd: number | null = null;

	sorted.forEach((session) => {
		if (!lastEnd || session.start.toMillis() >= lastEnd) {
			groups.push([session]);
		} else {
			groups[groups.length - 1].push(session);
		}

		if (!lastEnd || session.end.toMillis() > lastEnd) {
			lastEnd = session.end.toMillis();
		}
	});

	return groups;
};

export const getStyledSessions = (sessions: Session[]): StyledSession[] => {
	if (sessions.length === 0) return [];

	const sTypes = [...new Set(sessions.map((s) => s.sessionType.id))];

	const groups = sortIntoGroups(sessions);

	return groups.flatMap((group) => {
		const columns: SessionWithTime[][] = [];

		for (const session of group) {
			let placed = false;

			for (let i = 0; i < columns.length; i++) {
				const lastInCol = columns[i][columns[i].length - 1];
				if (session.start.toMillis() >= lastInCol.end.toMillis()) {
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
			const colIndex = session.column ?? 0;
			const totalCols = columns.length;

			let canSpan = 1;
			for (let i = colIndex + 1; i < totalCols; i++) {
				const hasOverlap = columns[i].some(
					(other) => session.start < other.end && session.end > other.start
				);
				if (hasOverlap) break;
				canSpan++;
			}

			const left = (colIndex / totalCols) * 95;
			const width = (canSpan / totalCols) * 95;
			const actualWidth = colIndex < totalCols - 1 ? width * 1.7 : width;

			return {
				...session,
				style: styleCreator([
					`left: ${left}%`,
					`width: ${Math.min(actualWidth, 95 - left)}%`,
					`z-index: ${colIndex}`,
					`height: ${findHeight(session.start, session.end)}rem`,
					`top: ${findMargin(session.start)}rem`,
					`background-color: ${backgroundColors[sTypes.indexOf(session.sessionType.id) % backgroundColors.length]}`
				])
			};
		});
	});
};
