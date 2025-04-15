import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_MENTOR, ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, pendingTransfers, sessions, sessionTypes } from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { DateTime } from 'luxon';
import { alias } from 'drizzle-orm/mysql-core/alias';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_MENTOR) {
		redirect(307, '/schedule');
	}

	const oldMentor = alias(mentors, 'oldMentor');
	const newMentor = alias(mentors, 'newMentor');

	const query = db
		.select()
		.from(pendingTransfers)
		.leftJoin(oldMentor, eq(oldMentor.id, pendingTransfers.oldMentor))
		.leftJoin(newMentor, eq(newMentor.id, pendingTransfers.newMentor))
		.leftJoin(sessions, eq(sessions.id, pendingTransfers.sessionId))
		.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type));

	if (roleOf(user) < ROLE_STAFF) {
		query.where(
			or(eq(pendingTransfers.oldMentor, user.id), eq(pendingTransfers.newMentor, user.id))
		);
	}

	const pendingSessionTransfers = await query;

	pendingSessionTransfers.sort((a, b) => {
		const a_dt = DateTime.fromISO(a.session?.start);
		const b_dt = DateTime.fromISO(b.session?.start);
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
		pendingSessionTransfers,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Facility Calendar', url: '/dash/cal' },
			{ title: 'Transfer Requests' }
		]
	};
};
