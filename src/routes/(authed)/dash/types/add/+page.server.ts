import { roleOf } from '$lib';
import { loadUserData } from '$lib/userInfo';
import { ROLE_STAFF } from '$lib/utils';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessionTypes } from '$lib/server/db/schema';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { typeSchema } from '../typeSchema';
import { nanoid } from 'nanoid';
export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}
	const form = await superValidate(zod(typeSchema));

	return {
		form,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Session Types', url: '/dash/types' },
			{ title: 'New' }
		]
	};
};
export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(typeSchema));
		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			redirect(307, '/schedule');
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		await db.insert(sessionTypes).values({
			id: nanoid(),
			name: form.data.name,
			length: form.data.length,
			order: form.data.order,
			rating: form.data.rating,
			category: form.data.category,
			bookable: form.data.bookable
		});

		return { form };
	}
};
