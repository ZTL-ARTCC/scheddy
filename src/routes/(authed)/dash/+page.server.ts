import type { PageServerLoad } from './$types';
import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_MENTOR } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { DateTime } from 'luxon';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_MENTOR) {
		redirect(307, '/schedule');
	}

	const allSessions = await db.select().from(sessions);

	let yourSessions = 0;
	const mentorsSoFar = [];
	let mentors = 0;
	let upcoming = 0;

	const now = DateTime.utc();

	for (const sess of allSessions) {
		const start = DateTime.fromISO(sess.start);

		if (start < now) continue;

		upcoming++;

		if (sess.mentor === user.id) {
			yourSessions++;
		}
		if (!mentorsSoFar.includes(sess.mentor)) {
			mentorsSoFar.push(sess.mentor);
			mentors += 1;
		}
	}

	return {
		yourSessions,
		mentors,
		upcoming,
		breadcrumbs: [{ title: 'Dashboard' }]
	};
};
