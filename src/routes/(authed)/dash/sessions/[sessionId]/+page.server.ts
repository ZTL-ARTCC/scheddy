import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { DateTime } from 'luxon';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;

	const sessionList = await db
		.select()
		.from(sessions)
		.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
		.leftJoin(mentors, eq(mentors.id, sessions.mentor))
		.leftJoin(students, eq(students.id, sessions.student))
		.where(eq(sessions.id, params.sessionId));
	const sessionAndFriends = sessionList[0];

	if (
		roleOf(user) < ROLE_STAFF &&
		!(user.id == sessionAndFriends.session.student || user.id == sessionAndFriends.session.mentor)
	) {
		redirect(307, '/schedule');
	}

	const createdByUser = await db
		.select()
		.from(users)
		.where(eq(users.id, sessionAndFriends.session.createdBy));

	const createdAt = sessionAndFriends.session.createdAt
		? DateTime.fromISO(sessionAndFriends.session.createdAt).toLocaleString(DateTime.DATETIME_FULL)
		: 'Not specified';

	const createdBy = sessionAndFriends.session.createdBy
		? `${createdByUser[0].firstName} ${createdByUser[0].lastName} at ${createdAt}`
		: 'Not specified';

	return {
		sessionInfo: sessionAndFriends,
		isMentor: user.id == sessionAndFriends.session.mentor || roleOf(user) >= ROLE_STAFF,
		createdBy,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Facility Calendar', url: '/dash/cal' },
			{ title: 'Session Information' }
		]
	};
};

export const actions: Actions = {
	reschedule: async ({ cookies, params, request }) => {
		const { user } = (await loadUserData(cookies))!;
		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, params.sessionId));
		const sessionAndFriends = sessionList[0];

		if (
			roleOf(user) < ROLE_STAFF &&
			!(user.id == sessionAndFriends.session.student || user.id == sessionAndFriends.session.mentor)
		) {
			redirect(307, '/schedule');
		}

		const formData = await request.formData();
		const newDate = formData.get('date')!.toString();
		const newDateObj = DateTime.fromISO(newDate);

		await db
			.update(sessions)
			.set({ start: newDateObj.setZone('utc').toString() })
			.where(eq(sessions.id, params.sessionId));
	}
};
