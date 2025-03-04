import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { roleString } from '$lib/utils';
import { roleOf } from '$lib';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;

	const session = (await db.select().from(sessions).where(eq(sessions.id, params.id)))[0];

	if (session.student != user.id) {
		return redirect(307, '/schedule');
	}

	return { user, role: roleString(roleOf(user)) };
};

export const actions: Actions = {
	default: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;

		const session = (await db.select().from(sessions).where(eq(sessions.id, event.params.id)))[0];

		if (session.student != user.id) {
			return redirect(307, '/schedule');
		}

		await db.delete(sessions).where(eq(sessions.id, event.params.id));
	}
};
