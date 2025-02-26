import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessionTypes, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { typeSchema } from './typeSchema';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF && user.id != params.userId) {
		redirect(307, '/schedule');
	}

	const mentor = await db
		.select()
		.from(users)
		.where(eq(users.id, Number.parseInt(params.userId!)));

	if (!mentor || mentor.length === 0) {
		redirect(307, '/dash');
	}

	const allowedTypes: string[] | null = mentor[0].allowedSessionTypes
		? JSON.parse(mentor[0].allowedSessionTypes)
		: null;

	const validTypes = await db.select().from(sessionTypes);

	const allowed: Record<string, boolean> = {};
	const typesMap: Record<string, string> = {};
	for (const typ of validTypes) {
		allowed[typ.id] = allowedTypes !== null && allowedTypes.includes(typ.id);
		typesMap[typ.id] = typ.name;
	}

	const form = await superValidate({ allowed }, zod(typeSchema));

	return {
		user,
		mentor: mentor[0],
		form,
		typesMap,
		breadcrumbs:
			user.id === mentor[0].id
				? [
						{ title: 'Dashboard', url: '/dash' },
						{ title: 'My Schedule', url: '/dash/mentors/' + mentor[0].id },
						{ title: 'Session Types' }
					]
				: [
						{ title: 'Dashboard', url: '/dash' },
						{ title: 'Mentors', url: '/dash/mentors' },
						{
							title: mentor[0].firstName + ' ' + mentor[0].lastName,
							url: '/dash/mentors/' + mentor[0].id
						},
						{ title: 'Session Types' }
					]
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(typeSchema));

		const { user } = (await loadUserData(event.cookies))!;
		if (roleOf(user) < ROLE_STAFF) {
			return fail(403, { form });
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		const allowed = JSON.stringify(
			Object.entries(form.data.allowed)
				.filter((v) => {
					return v[1];
				})
				.map((u) => u[0])
		);

		await db
			.update(users)
			.set({
				allowedSessionTypes: allowed
			})
			.where(eq(users.id, event.params.userId));

		return { form };
	}
};
