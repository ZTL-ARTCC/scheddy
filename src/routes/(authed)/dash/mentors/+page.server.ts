import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_MENTOR, ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { gte, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;
	if (roleOf(user) < ROLE_STAFF) {
		redirect(307, '/schedule');
	}
	const mentors = await db
		.select()
		.from(users)
		.where(or(gte(users.role, ROLE_MENTOR), gte(users.roleOverride, ROLE_MENTOR)));
	const mentorsWithAvail = mentors.map((mentor: typeof users.$inferSelect) => {
		let isAvailable = false;
		const mentorAvailability = JSON.parse(mentor.mentorAvailability!);
		if (mentorAvailability) {
			isAvailable = Object.keys(mentorAvailability)
				.filter((day) => day !== 'timezone' && day !== 'exceptions')
				.some((day) => mentorAvailability[day].available === true);
		}
		return { ...mentor, isAvailable };
	});
	return {
		user,
		users: mentorsWithAvail,
		breadcrumbs: [{ title: 'Dashboard', url: '/dash' }, { title: 'Mentors' }]
	};
};
