import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { DateTime, Interval } from 'luxon';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	const validTypes = await db.select().from(sessionTypes);

	const typesMap: Record<string, string> = {};
	for (const typ of validTypes) {
		typesMap[typ.id] = typ.name;
	}

	const allSessions = await db
		.select()
		.from(sessions)
		.leftJoin(students, eq(students.id, sessions.student))
		.leftJoin(mentors, eq(mentors.id, sessions.mentor));

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
		mentorSessions,
		typesMap
	};
};
