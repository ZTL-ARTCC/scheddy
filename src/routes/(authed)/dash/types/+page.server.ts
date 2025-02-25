import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { sessionTypes } from '$lib/server/db/schema';
import { roleOf } from '$lib';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { ROLE_STAFF } from '$lib/utils';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createSchema } from './createSchema';
import { nanoid } from 'nanoid';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	return {
		user,
		types: await db.select().from(sessionTypes),
		createForm: await superValidate(zod(createSchema))
	};
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(createSchema));

		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			return fail(403, { createForm: form });
		}
		if (!form.valid) {
			return fail(400, { createForm: form });
		}

		await db.insert(sessionTypes).values({
			id: nanoid(),
			name: form.data.name,
			length: form.data.duration,
			category: form.data.category,
			order: form.data.order,
			rating: form.data.rating
		});

		return { createForm: form };
	},
	remove: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			return fail(403);
		}

		const id = (await event.request.formData()).get('id')!.toString();

		await db.delete(sessionTypes).where(eq(sessionTypes.id, id));
	}
};
