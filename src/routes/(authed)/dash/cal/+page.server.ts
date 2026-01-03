import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_MENTOR } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { DateTime } from 'luxon';
import { backgroundColors } from '$lib/ui/cal/utils/utils';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_MENTOR) {
		redirect(307, '/schedule');
	}

	const mentorSessions = await db
		.select()
		.from(sessions)
		.leftJoin(students, eq(students.id, sessions.student))
		.leftJoin(mentors, eq(mentors.id, sessions.mentor))
		.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
		.where(eq(sessions.cancelled, false));

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

	const sTypesInSessions = [...new Set(mentorSessions.map((s) => s.sessionType!.id))];
	const backgroundByType: Record<string, string> = {};

	for (const [i, sType] of sTypesInSessions.entries()) {
		backgroundByType[sType] = backgroundColors[i % backgroundColors.length];
	}

	return {
		user,
		mentorSessions,
		backgroundByType,
		usersArr: await db.select().from(users),
		sessionTypesArr: await db.select().from(sessionTypes),
		breadcrumbs: [{ title: 'Dashboard', url: '/dash' }, { title: 'Facility Calendar' }]
	};
};
