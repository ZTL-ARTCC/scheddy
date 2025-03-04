import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { users } from '$lib/server/db/schema';
import { roleOf } from '$lib';
import { redirect } from '@sveltejs/kit';
import { eq, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { ROLE_STAFF } from '$lib/utils';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { setSchema } from './setSchema';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	const data = {};
	if (url.searchParams.has('id')) {
		data.id = Number.parseInt(url.searchParams.get('id'));
	}
	if (url.searchParams.has('roleOverride')) {
		data.roleOverride = Number.parseInt(url.searchParams.get('roleOverride'));
	}

	const form = await superValidate(data, zod(setSchema));

	const allUsers = await db.select().from(users);
	const usersMap: Record<number, string> = {};
	for (const user of allUsers) {
		usersMap[user.id] = user.firstName + ' ' + user.lastName;
	}

	return {
		user,
		users: await db.select().from(users).where(ne(users.roleOverride, 0)),
		usersMap,
		form,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'User Management', url: '/dash/users' },
			{ title: 'Add/Update Override' }
		]
	};
};
export const actions: Actions = {
	default: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			redirect(307, '/schedule');
		}

		const form = await superValidate(event, zod(setSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		await db
			.update(users)
			.set({
				roleOverride: form.data.roleOverride
			})
			.where(eq(users.id, form.data.id));

		return {
			form
		};
	}
};
