import { sessions, mentors, sessionTypes } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { loadUserData } from '$lib/userInfo';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { DateTime } from 'luxon';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;

	const validTypes = await db.select().from(sessionTypes);

	const typesMap: Record<string, string> = {};
	for (const typ of validTypes) {
		typesMap[typ.id] = typ.name;
	}

	const sessionsAsStudent = await db
		.select()
		.from(sessions)
		.leftJoin(mentors, eq(sessions.mentor, mentors.id))
		.where(eq(sessions.student, user.id));

	const now = DateTime.utc();
	const upcomingSessions = sessionsAsStudent.filter(
		(entry) => DateTime.fromISO(entry.session.start) > now
	);
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

	return { user, upcomingSessions, typesMap };
};
