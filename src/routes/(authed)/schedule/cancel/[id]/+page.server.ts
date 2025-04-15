import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { ROLE_STUDENT, roleString } from '$lib/utils';
import { roleOf } from '$lib';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, users, userTokens } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { appointment_canceled } from '$lib/emails/student/appointment_canceled';
import { DateTime } from 'luxon';
import { sendEmail } from '$lib/email';
import { session_canceled } from '$lib/emails/mentor/session_canceled';

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

		const sessionData = (
			await db
				.select()
				.from(sessions)
				.leftJoin(mentors, eq(sessions.mentor, mentors.id))
				.leftJoin(users, eq(sessions.student, users.id))
				.leftJoin(sessionTypes, eq(sessions.type, sessionTypes.id))
				.where(eq(sessions.id, event.params.id))
		)[0];

		if (sessionData.session.student != user.id) {
			return redirect(307, '/schedule');
		}

		const studentEmailContent = appointment_canceled({
			startTime: DateTime.fromISO(sessionData.session.start),
			timezone: sessionData.session.timezone,
			mentorName: sessionData.mentor?.firstName + ' ' + sessionData.mentor?.lastName,
			duration: sessionData.sessionType?.length ?? 0,
			sessionId: sessionData.session.id,
			type: sessionData.sessionType?.name ?? 'No Type',
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain,
			cancellationReason: 'Not Specified',
			cancellationUserLevel: ROLE_STUDENT
		});

		const mentorEmailContent = session_canceled({
			startTime: DateTime.fromISO(sessionData.session.start),
			timezone: sessionData.mentor?.timezone ?? 'America/New York',
			studentName: sessionData.user?.firstName + ' ' + sessionData.user?.firstName,
			duration: sessionData.sessionType?.length ?? 0,
			sessionId: sessionData.session.id,
			type: sessionData.sessionType?.name ?? 'No Type',
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain,
			cancellationReason: 'Not Specified',
			cancellationUserLevel: ROLE_STUDENT
		});

		try {
			await sendEmail(
				sessionData.user?.email,
				'Appointment canceled - ' +
					DateTime.fromISO(sessionData.session.start)
						.setZone(sessionData.session.timezone)
						.toLocaleString(DateTime.DATETIME_HUGE),
				studentEmailContent.raw,
				studentEmailContent.html
			);

			await sendEmail(
				sessionData.mentor?.email,
				'Session canceled - ' +
					DateTime.fromISO(sessionData.session.start)
						.setZone(sessionData.mentor.timezone)
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
				cancellationUserLevel: ROLE_STUDENT,
				cancellationReason: 'Not Specified'
			})
			.where(eq(sessions.id, event.params.id));
	}
};
