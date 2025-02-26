import { roleOf } from '$lib';
import { loadUserData } from '$lib/userInfo';
import { ROLE_STAFF } from '$lib/utils';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessionTypes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { editSchema } from './editSchema';
export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	const data = (await db.select().from(sessionTypes).where(eq(sessionTypes.id, params.typeId)))[0];

	const form = await superValidate(data, zod(editSchema));

	return {
		form,
		breadcrumbs: [{ title: 'Dashboard', url: '/dash' }, { title: 'Session Types', url: '/dash/types' }, { title: data.name }]
	};
};
export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(editSchema));
		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			redirect(307, '/schedule');
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		await db.update(sessionTypes)
			.set({
				name: form.data.name,
				length: form.data.length,
				order: form.data.order,
				rating: form.data.rating,
				category: form.data.category
			})
			.where(eq(sessionTypes.id, event.params.typeId));

		return { form };
	}
}
