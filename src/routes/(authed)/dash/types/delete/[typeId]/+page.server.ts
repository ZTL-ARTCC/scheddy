import { roleOf } from '$lib';
import { loadUserData } from '$lib/userInfo';
import { ROLE_STAFF } from '$lib/utils';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessions, sessionTypes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteSchema } from './deleteSchema';
export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	const data = (await db.select().from(sessionTypes).where(eq(sessionTypes.id, params.typeId)))[0];

	const form = await superValidate(data, zod(deleteSchema));

	return {
		form,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Session Types', url: '/dash/types' },
			{ title: data ? data.name : '' },
			{ title: 'Remove' }
		]
	};
};
export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(deleteSchema));
		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			redirect(307, '/schedule');
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		await db.delete(sessions).where(eq(sessions.type, event.params.typeId));
		await db.delete(sessionTypes).where(eq(sessionTypes.id, event.params.typeId));

		return { form };
	}
};
