import type { PageServerLoad } from './$types';
import { loadUserData } from '$lib/userInfo';
import { sessionTypes } from '$lib/server/db/schema';
import { roleOf } from '$lib';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ROLE_STAFF } from '$lib/utils';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}

	const types = await db.select().from(sessionTypes);

	types.sort((a, b) => {
		const categoryCompare = a.category.localeCompare(b.category);
		if (categoryCompare == 0) {
			const orderCompare = a.order - b.order;
			if (orderCompare == 0) {
				return a.name.localeCompare(b.name);
			} else {
				return orderCompare;
			}
		} else {
			return categoryCompare;
		}
	});

	return {
		user,
		types,
		breadcrumbs: [{ title: 'Dashboard', url: '/dash' }, { title: 'Session Types' }]
	};
};
