// This is a disaster
// TODO: Fix this mess
import { DateTime, Duration, Interval } from 'luxon';
import { sessions, sessionTypes, users } from '$lib/server/db/schema';
import type { DayAvailability, MentorAvailability } from '$lib/availability';
import { serverConfig } from '$lib/config/server';

export function slottificate(
	sTypes: (typeof sessionTypes.$inferSelect)[],
	mentors: (typeof users.$inferSelect)[],
	allSessions: (typeof sessions.$inferSelect)[]
): Record<string, { slot: Interval; mentor: number }[]> {
	const slotData: Record<string, { slot: Interval; mentor: number }[]> = {};

	const now = DateTime.utc();
	const tomorrow = now.plus({ days: 1 });
	const validDaysToBook: DateTime[] = [];
	for (let i = 0; i <= serverConfig.bookings.max_days_ahead; i++) {
		validDaysToBook.push(now.plus({ hours: i * 24 }));
	}

	const sessionsByMentor: Record<number, (typeof sessions.$inferSelect)[]> = {};
	for (const sess of allSessions) {
		if (sess.mentor == null) continue;

		if (!sessionsByMentor[sess.mentor]) {
			sessionsByMentor[sess.mentor] = [];
		}
		sessionsByMentor[sess.mentor].push(sess);
	}

	const typelengths: Record<string, number> = {};
	for (const typ of sTypes) {
		typelengths[typ.id] = typ.length;
	}

	for (const typ of sTypes) {
		const slots = [];
		for (const mentor of mentors) {
			if (!mentor.bookableSessionTypes) continue;
			if (!mentor.mentorAvailability) continue;

			const allowedTypes = JSON.parse(mentor.bookableSessionTypes);
			if (!allowedTypes) continue;
			if (!allowedTypes.includes(typ.id)) continue;

			const availability: MentorAvailability | null = JSON.parse(mentor.mentorAvailability);
			if (!availability) continue;

			const mentorsOtherSessions: (typeof sessions.$inferSelect)[] =
				sessionsByMentor[mentor.id] || [];

			const availablePeriodsMentorsTime: Interval[] = [];
			const unavailablePeriodsMentorsTime: Interval[] = [];

			// create a list of blocked off periods
			for (const otherSess of mentorsOtherSessions) {
				const start = DateTime.fromISO(otherSess.start);
				const end = start.plus({ minutes: typelengths[otherSess.type]! });

				unavailablePeriodsMentorsTime.push(Interval.fromDateTimes(start, end));
			}

			// figure out their availability for each day
			for (const validDay of validDaysToBook) {
				const dayInMentorsTz = validDay.setZone(mentor.timezone);

				let todaysAvail: DayAvailability | null = null;
				// do they have a date exception set?

				const exceptionDateKey = dayInMentorsTz.toFormat('yyyy-MM-dd');
				if (Object.keys(availability.exceptions).includes(exceptionDateKey)) {
					todaysAvail = availability.exceptions[exceptionDateKey];
				} else {
					// no exception, use weekday availability
					if (dayInMentorsTz.weekday == 1) todaysAvail = availability.monday;
					else if (dayInMentorsTz.weekday == 2) todaysAvail = availability.tuesday;
					else if (dayInMentorsTz.weekday == 3) todaysAvail = availability.wednesday;
					else if (dayInMentorsTz.weekday == 4) todaysAvail = availability.thursday;
					else if (dayInMentorsTz.weekday == 5) todaysAvail = availability.friday;
					else if (dayInMentorsTz.weekday == 6) todaysAvail = availability.saturday;
					else if (dayInMentorsTz.weekday == 7) todaysAvail = availability.sunday;
				}

				// convert the availability back to an interval
				if (todaysAvail && todaysAvail.available) {
					// we are available, list our intervals

					const availableIntervalsStruct: {
						start: { hour: number; minute: number };
						end: { hour: number; minute: number };
					}[] = [];
					availableIntervalsStruct.push(todaysAvail);
					if (todaysAvail.extraRecords) {
						availableIntervalsStruct.push(...todaysAvail.extraRecords);
					}

					for (const rawInterval of availableIntervalsStruct) {
						const start = dayInMentorsTz.set({
							hour: rawInterval.start.hour,
							minute: rawInterval.start.minute,
							second: 0,
							millisecond: 0
						});
						const end = dayInMentorsTz.set({
							hour: rawInterval.end.hour,
							minute: rawInterval.end.minute,
							second: 0,
							millisecond: 0
						});

						const interval = Interval.fromDateTimes(start, end);

						availablePeriodsMentorsTime.push(interval);
					}
				}
			}

			// ok, we have a list of available and unavailable periods, but they're still in the mentor's timezone
			// so we need to convert it back into UTC
			// timezones suck :/
			const availablePeriods = [];
			const unavailablePeriods = [];

			for (const period of availablePeriodsMentorsTime) {
				if (!period.start || !period.end) {
					continue; // invalid... ignore
				}
				availablePeriods.push(
					Interval.fromDateTimes(period.start.setZone('utc'), period.end.setZone('utc'))
				);
			}
			for (const period of unavailablePeriodsMentorsTime) {
				if (!period.start || !period.end) {
					continue; // invalid... ignore
				}
				unavailablePeriods.push(
					Interval.fromDateTimes(period.start.setZone('utc'), period.end.setZone('utc'))
				);
			}

			// calculate difference of each availablePeriod to get a list of o.k. slots
			const thisMentorAvailability: Interval[] = [];

			for (const period of availablePeriods) {
				thisMentorAvailability.push(...period.difference(...unavailablePeriods));
			}

			// split each available period into individual session slots
			const individualSlots: Interval[] = [];

			const minimumLength = typ.length!;

			for (const period of thisMentorAvailability) {
				/* TODO: This leaves out a LOT of possible slots...
				 * really should rework this at some point.
				 * I'm just scared to mess with this code, since it currently
				 * functions -XD */
				individualSlots.push(...period.splitBy(Duration.fromObject({ minutes: minimumLength })));
			}

			// finally, drop any that are too short or <24h

			const validSlots: Interval[] = [];

			for (const potentialSlot of individualSlots) {
				if (potentialSlot.start == null) continue;
				if (potentialSlot.length('minutes') >= minimumLength && potentialSlot.start >= tomorrow) {
					validSlots.push(potentialSlot);
				}
			}

			slots.push(
				...validSlots.map((u) => {
					return {
						slot: u.toISO(),
						mentor: mentor.id
					};
				})
			);
		}

		// sort chronologically
		slots.sort((a, b) => {
			const a_dt = Interval.fromISO(a.slot);
			const b_dt = Interval.fromISO(b.slot);
			if (a_dt.start < b_dt.start) {
				return -1;
			} else if (a_dt.start > b_dt.start) {
				return 1;
			} else {
				return 0;
			}
		});

		slotData[typ.id] = slots;
	}

	return slotData;
}
