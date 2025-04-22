import { loadUserData, type SessionAndFriends } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { appointment_canceled } from '$lib/emails/student/appointment_canceled';
import { session_canceled } from '$lib/emails/mentor/session_canceled';
import { sendEmail } from '$lib/email';
import { DateTime } from 'luxon';
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
		const sessionAndFriends = sessionList[0] as unknown as SessionAndFriends;

		if (roleOf(user) < ROLE_STAFF && !(user.id == sessionAndFriends.session.mentor)) {
			redirect(307, '/schedule');
		}

		const reason = (await request.formData()).get('reason');

		const studentEmailContent = appointment_canceled({
			startTime: DateTime.fromISO(sessionAndFriends.session.start),
			timezone: sessionAndFriends.session.timezone,
			duration: sessionAndFriends.sessionType?.length,
			mentorName: sessionAndFriends.mentor.firstName + ' ' + sessionAndFriends.mentor.lastName,
			sessionId: params.sessionId,
			type: sessionAndFriends.sessionType?.name,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain,
			cancellationReason: reason ? reason.toString() : 'Not Specified',
			cancellationUserLevel: roleOf(user)
		});

		const mentorEmailContent = session_canceled({
			startTime: DateTime.fromISO(sessionAndFriends.session.start),
			timezone: sessionAndFriends.mentor.timezone,
			duration: sessionAndFriends.sessionType?.length,
			studentName: sessionAndFriends.student.firstName + ' ' + sessionAndFriends.student.lastName,
			sessionId: params.sessionId,
			type: sessionAndFriends.sessionType?.name,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain,
			cancellationReason: reason ? reason.toString() : 'Not Specified',
			cancellationUserLevel: roleOf(user)
		});

		try {
			await sendEmail(
				sessionAndFriends.student.email,
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
						.setZone(sessionAndFriends.mentor.timezone)
						.toLocaleString(DateTime.DATETIME_HUGE),
				mentorEmailContent.raw,
				mentorEmailContent.html
			);
		} catch (e) {
			console.error(e);
		}

		await db
			.update(sessions)
			.set({
				cancelled: true,
				cancellationUserLevel: roleOf(user),
				cancellationReason: reason ? reason.toString() : 'Not Specified'
			})
			.where(eq(sessions.id, params.sessionId));
	}
};
