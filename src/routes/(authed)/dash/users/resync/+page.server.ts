import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { users } from '$lib/server/db/schema';
import { roleOf } from '$lib';
import { redirect } from '@sveltejs/kit';
import { eq, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { ROLE_STAFF } from '$lib/utils';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { syncSchema } from './syncSchema';
import { serverConfig } from '$lib/config/server';
import { determineHighestRole } from '$lib/helpers/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	const form = await superValidate(zod(syncSchema));

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
			{ title: 'Resync User' }
		]
	};
};
export const actions: Actions = {
	default: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			redirect(307, '/schedule');
		}

		const form = await superValidate(event, zod(syncSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const vatusa_user_resp = await fetch(
			`${serverConfig.auth.vatusa.base}/user/${form.data.id}?apikey=${serverConfig.auth.vatusa.key}`,
			{
				headers: {
					Authorization: `Bearer ${serverConfig.auth.vatusa.key}`
				}
			}
		);

		if (!vatusa_user_resp.ok) {
			setError(form, 'id', 'Failed to load user data from VATUSA.');
			return {
				form
			};
		}

		const vatusa_info = await vatusa_user_resp.json();
		const highest_role = determineHighestRole(vatusa_info);

		await db
			.update(users)
			.set({
				role: highest_role
			})
			.where(eq(users.id, form.data.id));

		return {
			form
		};
	}
};
