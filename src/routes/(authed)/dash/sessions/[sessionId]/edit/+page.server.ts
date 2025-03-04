import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_MENTOR, ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students, users } from '$lib/server/db/schema';
import { eq, gte, or } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { DateTime } from 'luxon';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { editSchema } from './editSchema';

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

	const session = sessionAndFriends.session;

	const start = DateTime.fromISO(session.start);

	const sTypes = await db.select().from(sessionTypes);
	const typesMap: Record<string, { name: string; length: number }> = {};
	for (const type of sTypes) {
		typesMap[type.id] = type;
	}

	const data = {
		date: DateTime.fromISO(session.start).toISODate(),
		hour: start.hour,
		minute: start.minute,

		type: session.type,

		mentor: session.mentor
	};

	const form = await superValidate(data, zod(editSchema));

	const dmentors = await db
		.select()
		.from(users)
		.where(or(gte(users.roleOverride, ROLE_MENTOR), gte(users.role, ROLE_MENTOR)));
	const usersMap: Record<number, string> = {};
	for (const user of dmentors) {
		usersMap[user.id] = user.firstName + ' ' + user.lastName;
	}

	return {
		sessionInfo: sessionAndFriends,
		isMentor: user.id == sessionAndFriends.session.mentor || roleOf(user) >= ROLE_STAFF,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Facility Calendar', url: '/dash/cal' },
			{ title: 'Session Information', url: `/dash/sessions/${session.id}` },
			{ title: 'Edit Session' }
		],
		form,
		typesMap,
		usersMap
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;
		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, event.params.sessionId));
		const sessionAndFriends = sessionList[0];

		if (
			roleOf(user) < ROLE_STAFF &&
			!(user.id == sessionAndFriends.session.student || user.id == sessionAndFriends.session.mentor)
		) {
			redirect(307, '/schedule');
		}

		const form = await superValidate(event, zod(editSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		let date = DateTime.fromISO(form.data.date, { zone: sessionAndFriends.session.timezone });
		date = date.set({
			hour: form.data.hour,
			minute: form.data.minute
		});

		const data = {
			start: date.toString(),
			type: form.data.type
		};

		if (roleOf(user) >= ROLE_STAFF) {
			data.mentor = form.data.mentor;
		}

		await db.update(sessions).set(data).where(eq(sessions.id, event.params.sessionId));

		return { form };
	}
};
