import { sessions, mentors, sessionTypes } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { loadUserData } from '$lib/userInfo';
import type { PageServerLoad } from './$types';
import { and, eq, gte } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { roleOf } from '$lib';
import { roleString } from '$lib/utils';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;

	const now = DateTime.utc().toISO();
	const upcomingSessions = await db
		.select()
		.from(sessions)
		.leftJoin(mentors, eq(sessions.mentor, mentors.id))
		.leftJoin(sessionTypes, eq(sessions.type, sessionTypes.id))
		.where(and(eq(sessions.student, user.id), gte(sessions.start, now), eq(sessions.cancelled, false)));

	upcomingSessions.sort((a, b) => {
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

	return {
		user,
		upcomingSessions,
		role: roleString(roleOf(user))
	};
};
