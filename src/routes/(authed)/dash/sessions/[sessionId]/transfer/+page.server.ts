import { loadUserData, type SessionAndFriends } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_MENTOR, ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	mentors,
	pendingTransfers,
	sessions,
	sessionTypes,
	students,
	users
} from '$lib/server/db/schema';
import { eq, gte, or, and, ne } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { transferSchema } from '../transferSchema';
import { zod } from 'sveltekit-superforms/adapters';
import { DateTime } from 'luxon';
import { new_session_transfer_request } from '$lib/emails/mentor/transfer_request';
import { sendEmail } from '$lib/email';
import { serverConfig } from '$lib/config/server';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;

	const sessionList = await db
		.select()
		.from(sessions)
		.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
		.leftJoin(mentors, eq(mentors.id, sessions.mentor))
		.leftJoin(students, eq(students.id, sessions.student))
		.where(eq(sessions.id, params.sessionId));
	const sessionAndFriends = sessionList[0] as unknown as SessionAndFriends;

	if (
		roleOf(user) < ROLE_STAFF &&
		!(user.id == sessionAndFriends.session.student || user.id == sessionAndFriends.session.mentor)
	) {
		redirect(307, '/schedule');
	}

	const dmentors = (
		await db
			.select()
			.from(users)
			.where(
				and(
					or(gte(users.role, ROLE_MENTOR), gte(users.roleOverride, ROLE_MENTOR)),
					ne(users.id, user.id)
				)
			)
	).filter((u) => {
		const allowedSessionTypes: string[] = u.allowedSessionTypes
			? JSON.parse(u.allowedSessionTypes)
			: [];

		if (allowedSessionTypes.includes(sessionAndFriends.session.type)) {
			return u;
		}
	});

	const usersMap: Record<number, string> = {};

	for (const user of dmentors) {
		usersMap[user.id] = user.firstName + ' ' + user.lastName;
	}

	const data = {
		newMentor: dmentors.length === 0 ? 0 : dmentors[0].id
	};

	const form = await superValidate(data, zod(transferSchema));

	return {
		sessionId: params.sessionId,
		form,
		usersMap,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Facility Calendar', url: '/dash/cal' },
			{ title: 'Session Information', url: `/dash/sessions/${params.sessionId}` },
			{ title: 'Transfer Session' }
		]
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;
		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, event.params.sessionId));
		const sessionAndFriends = sessionList[0] as unknown as SessionAndFriends;

		if (
			roleOf(user) < ROLE_STAFF &&
			!(user.id == sessionAndFriends.session.student || user.id == sessionAndFriends.session.mentor)
		) {
			redirect(307, '/schedule');
		}

		const form = await superValidate(event, zod(transferSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const newMentor = await db.select().from(users).where(eq(users.id, form.data.newMentor));

		const mentorEmailContent = new_session_transfer_request({
			startTime: DateTime.fromISO(sessionAndFriends.session.start).setZone(
				sessionAndFriends.session.timezone
			),
			timezone: sessionAndFriends.session.timezone,
			studentName: sessionAndFriends.student?.firstName + ' ' + sessionAndFriends.student?.lastName,
			mentorName: sessionAndFriends.student?.firstName + ' ' + sessionAndFriends.student?.lastName,
			duration: sessionAndFriends.sessionType?.length,
			sessionId: sessionAndFriends.session.id,
			type: sessionAndFriends.sessionType?.name,
			transferLink: `${serverConfig.site.base_public}dash/sessions/${sessionAndFriends.session.id}`,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain
		});

		await sendEmail(
			newMentor[0].email,
			'Session transfer request - ' +
				DateTime.fromISO(sessionAndFriends.session.start)
					.setZone(sessionAndFriends.session.timezone)
					.toLocaleString(DateTime.DATETIME_HUGE),
			mentorEmailContent.raw,
			mentorEmailContent.html
		);

		await db.insert(pendingTransfers).values({
			oldMentor: sessionAndFriends.session.mentor,
			newMentor: form.data.newMentor,
			sessionId: sessionAndFriends.session.id
		});

		return { form };
	}
};
