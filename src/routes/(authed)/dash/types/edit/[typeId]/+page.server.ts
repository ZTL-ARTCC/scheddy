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
import { createSchema } from '../../createSchema';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	return {
		user,
		sType: await superValidate(
			(await db.select().from(sessionTypes).where(eq(sessionTypes.id, params.typeId)))[0],
			zod(createSchema)
		)
	};
};


export const actions: Actions = {
	update: async (event) => {
		const form = await superValidate(event, zod(createSchema));

		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			return fail(403, { createForm: form });
		}
		if (!form.valid) {
			return fail(400, { createForm: form });
		}

		await db
			.update(sessionTypes)
			.set({
				name: form.data.name,
				length: form.data.duration,
				category: form.data.category,
				rating: form.data.rating
			})
			.where(eq(sessionTypes.id, event.params.typeId as string));

		return { createForm: form };
	},
};