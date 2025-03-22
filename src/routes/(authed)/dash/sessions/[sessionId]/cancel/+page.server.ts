import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { appointment_canceled } from '$lib/emails/appointment_canceled';
import { sendEmail } from '$lib/email';
import { ARTCC_EMAIL_DOMAIN } from '$env/static/private';
import { PUBLIC_FACILITY_NAME } from '$env/static/public';
import { DateTime } from 'luxon';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;

	const sessionList = await db
		.select()
		.from(sessions)
		.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
		.leftJoin(mentors, eq(mentors.id, sessions.mentor))
		.leftJoin(students, eq(students.id, sessions.student))
		.where(eq(sessions.id, params.sessionId));
	const sessionAndFriends = sessionList[0];

	if (
		roleOf(user) < ROLE_STAFF &&
		!(user.id == sessionAndFriends.session.student || user.id == sessionAndFriends.session.mentor)
	) {
		redirect(307, '/schedule');
	}

	return {
		sessionInfo: sessionAndFriends,
		isMentor: user.id == sessionAndFriends.session.mentor || roleOf(user) >= ROLE_STAFF,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Facility Calendar', url: '/dash/cal' },
			{ title: 'Session Information' }
		]
	};
};

export const actions: Actions = {
	cancel: async ({ cookies, params, request }) => {
		const { user } = (await loadUserData(cookies))!;
		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, params.sessionId));
		const sessionAndFriends = sessionList[0];

		if (
			roleOf(user) < ROLE_STAFF &&
			!(user.id == sessionAndFriends.session.student || user.id == sessionAndFriends.session.mentor)
		) {
			redirect(307, '/schedule');
		}

		const reason = (await request.formData()).get('reason');

		const emailContent = {
			startTime: DateTime.fromISO(sessionAndFriends.session.start),
			timezone: sessionAndFriends.session.timezone,
			mentorName: sessionAndFriends.mentor.firstName + ' ' + sessionAndFriends.mentor.lastName,
			duration: sessionAndFriends.sessionType?.length,
			sessionId: params.sessionId,
			type: sessionAndFriends.sessionType?.name,
			facilityName: PUBLIC_FACILITY_NAME,
			emailDomain: ARTCC_EMAIL_DOMAIN,
			cancelationReason: reason ? reason : 'Not Specified',
			cancelationUserLevel: user.role
		};

		const studentEmailContent = appointment_canceled({ ...emailContent, student: true });
		const mentorEmailContent = appointment_canceled({ ...emailContent, student: false });

		try {
			await sendEmail(
				user.email,
				'Appointment canceled - ' +
					DateTime.fromISO(sessionAndFriends.session.start)
						.setZone(sessionAndFriends.session.timezone)
						.toLocaleString(DateTime.DATETIME_HUGE),
				studentEmailContent.raw,
				studentEmailContent.html
			);
			await sendEmail(
				sessionAndFriends.mentor.email,
				'Session canceled - ' +
					DateTime.fromISO(sessionAndFriends.session.start)
						.setZone(sessionAndFriends.session.timezone)
						.toLocaleString(DateTime.DATETIME_HUGE),
				mentorEmailContent.raw,
				mentorEmailContent.html
			);
		} catch (e) {
			console.error(e);
		}

		await db.delete(sessions).where(eq(sessions.id, params.sessionId));
	}
};
