import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_MENTOR } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students, users } from '$lib/server/db/schema';
import { eq, gte, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import CalendarItem from './CalendarItem.svelte';
import { DateTime } from 'luxon';
import { render } from 'svelte/server';

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

	const allmentors = await db
		.select()
		.from(users)
		.where(or(gte(users.role, ROLE_MENTOR), gte(users.roleOverride, ROLE_MENTOR)));

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

	const mentorSessionsInjectedItem = mentorSessions.map((u) => {
		return {
			calendarContent: render(CalendarItem, { props: u }),
			...u
		};
	});

	return {
		user,
		mentorSessions: mentorSessionsInjectedItem,
		mentors: allmentors,
		breadcrumbs: [{ title: 'Dashboard', url: '/dash' }, { title: 'Facility Calendar' }]
	};
};
