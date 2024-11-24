import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, sessionTypes, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import type { MentorAvailability } from '$lib/availability';
import { DateTime, Interval } from 'luxon';

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

	const allSessions = await db
		.select()
		.from(sessions)
		.leftJoin(users, eq(users.id, sessions.student))
		.where(eq(sessions.mentor, mentor[0].id));
	const mentorSessions = [];
	const now = DateTime.utc();
	for (const sess of allSessions) {
		const start = DateTime.fromISO(sess.session.start);
		if (start < now) continue;
		mentorSessions.push(sess);
	}

	mentorSessions.sort((a, b) => {
		const a_dt = Interval.fromISO(a.session.start);
		const b_dt = Interval.fromISO(b.session.start);
		if (a_dt.start < b_dt.start) {
			return -1;
		} else if (a_dt.start > b_dt.start) {
			return 1;
		} else {
			return 0;
		}
	});

	return {
		user,
		mentor: mentor[0],
		availability: avail,
		allowedTypes,
		typesMap,
		mentorSessions
	};
};
