import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { ROLE_DEVELOPER, ROLE_MENTOR, ROLE_STAFF, roleString } from '$lib/utils';
import { roleOf } from '$lib';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students, users } from '$lib/server/db/schema';
import { eq, gte, or } from 'drizzle-orm';
import type { DayAvailability, MentorAvailability } from '$lib/availability';
import { DateTime, Duration, Interval } from 'luxon';
import { fail, redirect } from '@sveltejs/kit';
import { MAX_BOOKING_AHEAD_DAYS } from '$env/static/private';
import { ulid } from 'ulid';
import { appointment_booked } from '$lib/emails/appointment_booked';
import { sendEmail } from '$lib/email';
import { new_session } from '$lib/emails/new_session';

function slottificate(
	sTypes: (typeof sessionTypes.$inferSelect)[],
	mentors: (typeof users.$inferSelect)[],
	allSessions: (typeof sessions.$inferSelect)[]
): Record<string, { slot: Interval; mentor: number }[]> {
	const slotData: Record<string, { slot: Interval; mentor: number }[]> = {};

	const now = DateTime.utc();
	const tomorrow = now.plus({ days: 1 });
	const validDaysToBook: DateTime[] = [];
	for (let i = 0; i < Number.parseInt(MAX_BOOKING_AHEAD_DAYS); i++) {
		validDaysToBook.push(now.plus({ days: i }));
	}

	const sessionsByMentor = {};
	for (const sess of allSessions) {
		if (sess.mentor == null) continue;

		if (!sessionsByMentor[sess.mentor]) {
			sessionsByMentor[sess.mentor] = [];
		}
		sessionsByMentor[sess.mentor].push(sess);
	}

	for (const typ of sTypes) {
		const slots = [];
		for (const mentor of mentors) {
			const allowedTypes = JSON.parse(mentor.allowedSessionTypes);
			if (!allowedTypes) continue;
			if (!allowedTypes.includes(typ.id)) continue;

			const availability: MentorAvailability | null = JSON.parse(mentor.mentorAvailability);
			if (!availability) continue;

			const mentorsOtherSessions = sessionsByMentor[mentor.id] || [];

			const availablePeriodsMentorsTime: Interval[] = [];
			const unavailablePeriodsMentorsTime: Interval[] = [];

			// create a list of blocked off periods
			for (const otherSess of mentorsOtherSessions) {
				const start = DateTime.fromISO(otherSess.start);
				const end = start.plus({ minutes: typ.length });

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
					// we are available
					const start = dayInMentorsTz.set({
						hour: todaysAvail.start.hour,
						minute: todaysAvail.start.minute,
						second: 0,
						millisecond: 0
					});
					const end = dayInMentorsTz.set({
						hour: todaysAvail.end.hour,
						minute: todaysAvail.end.minute,
						second: 0,
						millisecond: 0
					});

					const interval = Interval.fromDateTimes(start, end);

					availablePeriodsMentorsTime.push(interval);
				}
			}

			// ok, we have a list of available and unavailable periods, but they're still in the mentor's timezone
			// so we need to convert it back into UTC
			// timezones suck :/
			const availablePeriods = [];
			const unavailablePeriods = [];

			for (const period of availablePeriodsMentorsTime) {
				if (!period.start || !period.end) {
					console.log(period);
					continue; // invalid... ignore
				}
				availablePeriods.push(
					Interval.fromDateTimes(period.start.setZone('utc'), period.end.setZone('utc'))
				);
			}
			for (const period of unavailablePeriodsMentorsTime) {
				if (!period.start || !period.end) {
					console.log(period);
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

export const load: PageServerLoad = async ({ cookies, url }) => {
	const { user } = (await loadUserData(cookies))!;

	const sTypes = await db.select().from(sessionTypes);
	const mentors = await db
		.select()
		.from(users)
		.where(or(gte(users.role, ROLE_MENTOR), gte(users.roleOverride, ROLE_MENTOR)));

	const allSessions = await db.select().from(sessions);

	const slotData = slottificate(sTypes, mentors, allSessions);

	const originalSessionType = url.searchParams.has('reschedule')
		? url.searchParams.get('type')
		: null;

	const originalSessionId = url.searchParams.get('sessionId')!;

	return {
		user,
		role: roleString(roleOf(user)),
		isTrainer: roleOf(user) >= ROLE_MENTOR,
		isStaff: roleOf(user) >= ROLE_STAFF,
		isDeveloper: roleOf(user) >= ROLE_DEVELOPER,
		sessionTypes: sTypes,
		slotData,
		originalSessionType,
		originalSessionId
	};
};

export const actions: Actions = {
	book: async ({ cookies, request, url }) => {
		const { user } = (await loadUserData(cookies))!;

		const formData = await request.formData();
		const requestedSlotId = formData.get('timeslot')!;
		const requestedType = formData.get('type')!;
		const timezone = formData.get('timezone')!;
		const orginalSessionId = url.searchParams.get('sessionId')!;
		const reschedule = url.searchParams.has('reschedule')!;

		const sTypes = await db.select().from(sessionTypes);
		const mentors = await db
			.select()
			.from(users)
			.where(or(gte(users.role, ROLE_MENTOR), gte(users.roleOverride, ROLE_MENTOR)));
		const allSessions = await db.select().from(sessions);

		const slotData = slottificate(sTypes, mentors, allSessions);

		if (!slotData[requestedType]) {
			return fail(400);
		}

		const slotObj = {
			slot: requestedSlotId.split('@')[0],
			mentor: Number.parseInt(requestedSlotId.split('@')[1])
		};
		const availableSlots = slotData[requestedType];

		let slotStillAvailable = false;
		for (const availSlot of availableSlots) {
			if (availSlot.slot === slotObj.slot && availSlot.mentor == slotObj.mentor) {
				slotStillAvailable = true;
			}
		}

		if (!slotStillAvailable) {
			return fail(400);
		}

		const interval = Interval.fromISO(slotObj.slot);
		const start = interval.start.setZone('utc');

		const mentor = (await db.select().from(users).where(eq(users.id, slotObj.mentor)))[0]!;

		let duration = 0;
		let typename = '';
		for (const typ of sTypes) {
			if (typ.id === requestedType) {
				duration = typ.length;
				typename = typ.name;
			}
		}

		const id = ulid();

		const studentEmailContent = appointment_booked({
			startTime: start.setZone(timezone.toString()),
			timezone: timezone.toString(),
			mentorName: mentor.firstName + ' ' + mentor.lastName,
			duration,
			sessionId: id,
			type: typename,
			link_params: `?sessionId=${id}?reschedule=true?type=${requestedType}`,
			reschedule
		});
		const mentorEmailContent = new_session({
			startTime: start.setZone(mentor.timezone),
			timezone: mentor.timezone,
			studentName: user.firstName + ' ' + user.lastName,
			duration,
			sessionId: id,
			type: typename
		});

		await db.insert(sessions).values({
			id,
			mentor: slotObj.mentor,
			student: user.id,
			start: start.toISO(),
			type: requestedType,
			timezone
		});

		if (reschedule) {
			await db.delete(sessions).where(eq(sessions.id, orginalSessionId));
		}

		await sendEmail(
			user.email,
			reschedule
				? 'Appointment updated'
				: 'Appointment booked' +
						' - ' +
						start.setZone(timezone).toLocaleString(DateTime.DATETIME_HUGE),
			studentEmailContent.raw,
			studentEmailContent.html
		);

		await sendEmail(
			mentor.email,
			'New session booked - ' +
				start.setZone(mentor.timezone).toLocaleString(DateTime.DATETIME_HUGE),
			mentorEmailContent.raw,
			mentorEmailContent.html
		);
	},
	cancel: async ({ cookies, request }) => {
		const { user } = (await loadUserData(cookies))!;
		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, request.sessionId));
		const sessionAndFriends = sessionList[0];

		if (
			roleOf(user) < ROLE_STAFF &&
			!(user.id == sessionAndFriends.session.student || user.id == sessionAndFriends.session.mentor)
		) {
			redirect(307, '/schedule');
		}

		await db.delete(sessions).where(eq(sessions.id, request.sessionId));
	}
};
