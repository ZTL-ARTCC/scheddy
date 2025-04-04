import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, sessionTypes, students, mentors, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import type { MentorAvailability } from '$lib/availability';
import { DateTime } from 'luxon';
import { getTimeZones } from '@vvo/tzdb';

const createUTCInt = (date: string, hr: number, min: number, timezone: string) => {
	const iso = `${date}T${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00Z`;

	const tz = getTimeZones().filter((tz) => tz.name === timezone)[0];

	return new Date(iso).getTime() - tz.currentTimeOffsetInMinutes * 60 * 1000;
};

export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF && user.id != params.userId) {
		redirect(307, '/schedule');
	}

	const mentor = await db
		.select()
		.from(users)
		.where(eq(users.id, Number.parseInt(params.userId!)));

	if (!mentor || mentor.length === 0) {
		redirect(307, '/dash');
	}

	const validTypes = await db.select().from(sessionTypes);

	const typesMap: Record<string, string> = {};
	for (const typ of validTypes) {
		typesMap[typ.id] = typ.name;
	}

	const avail: MentorAvailability | null = mentor[0].mentorAvailability
		? JSON.parse(mentor[0].mentorAvailability)
		: null;
	const allowedTypes: string[] | null = mentor[0].allowedSessionTypes
		? JSON.parse(mentor[0].allowedSessionTypes)
		: null;
	const bookableTypes: string[] | null = mentor[0].bookableSessionTypes
		? JSON.parse(mentor[0].bookableSessionTypes)
		: null;

	const allSessions = await db
		.select()
		.from(sessions)
		.where(and(eq(sessions.mentor, mentor[0].id), eq(sessions.cancelled, false)))
		.leftJoin(students, eq(students.id, sessions.student))
		.leftJoin(mentors, eq(mentors.id, sessions.mentor))
		.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))

	const mentorSessions = [];
	const now = DateTime.utc();
	for (const sess of allSessions) {
		const start = DateTime.fromISO(sess.session.start);
		if (start < now) continue;
		mentorSessions.push(sess);
	}

	mentorSessions.sort((a, b) => {
		const a_dt = DateTime.fromISO(a.session.start);
		const b_dt = DateTime.fromISO(b.session.start);
		if (a_dt < b_dt) {
			return -1;
		} else if (a_dt > b_dt) {
			return 1;
		} else {
			return 0;
		}
	});

	let ex_changed = false;

	if (avail?.exceptions) {
		for (const ex in avail.exceptions) {
			const ex_date = createUTCInt(
				ex,
				avail.exceptions[ex].start.hour,
				avail.exceptions[ex].start.minute,
				mentor[0].timezone
			);

			const time_now = new Date().getTime();

			if (ex_date < time_now) {
				delete avail.exceptions[ex];
				ex_changed = true;
			}
		}
	}

	if (ex_changed) {
		await db
			.update(users)
			.set({
				mentorAvailability: JSON.stringify(avail)
			})
			.where(eq(users.id, Number.parseInt(params.userId!)));
	}

	return {
		user,
		mentor: mentor[0],
		availability: avail,
		allowedTypes,
		bookableTypes,
		typesMap,
		mentorSessions,
		breadcrumbs:
			user.id === mentor[0].id
				? [{ title: 'Dashboard', url: '/dash' }, { title: 'My Schedule' }]
				: [
						{ title: 'Dashboard', url: '/dash' },
						{ title: 'Mentors', url: '/dash/mentors' },
						{ title: mentor[0].firstName + ' ' + mentor[0].lastName }
					]
	};
};
