import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { users } from '$lib/server/db/schema';
import { roleOf } from '$lib';
import { fail, redirect } from '@sveltejs/kit';
import { eq, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { ROLE_STAFF } from '$lib/utils';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	return {
		user,
		users: await db.select().from(users).where(ne(users.allowBookings, true)),
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Blocked Users' }
		]
	};
};
export const actions: Actions = {
	add: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			return fail(403);
		}

		const uid = Number.parseInt((await event.request.formData()).get('id')!.toString());

		await db.update(users).set({ allowBookings: false }).where(eq(users.id, uid));
	},
	remove: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			return fail(403);
		}

		const uid = Number.parseInt((await event.request.formData()).get('id')!.toString());

		await db.update(users).set({ allowBookings: true }).where(eq(users.id, uid));
	}
};
