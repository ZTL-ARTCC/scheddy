import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { ROLE_STUDENT, roleString } from '$lib/utils';
import { roleOf } from '$lib';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { appointment_canceled } from '$lib/emails/appointment_canceled';
import { ARTCC_EMAIL_DOMAIN } from '$env/static/private';
import { PUBLIC_FACILITY_NAME } from '$env/static/public';
import { DateTime } from 'luxon';
import { sendEmail } from '$lib/email';

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
				.select({
					session: sessions,
					mentorFirstName: mentors.firstName,
					mentorLastName: mentors.lastName,
					mentorEmail: mentors.email,
					sTypeName: sessionTypes.name,
					sTypeDuration: sessionTypes.length
				})
				.from(sessions)
				.leftJoin(mentors, eq(sessions.mentor, mentors.id))
				.leftJoin(sessionTypes, eq(sessions.type, sessionTypes.id))
				.where(eq(sessions.id, event.params.id))
		)[0];

		if (sessionData.session.student != user.id) {
			return redirect(307, '/schedule');
		}

		const emailContent = {
			startTime: DateTime.fromISO(sessionData.session.start),
			timezone: sessionData.session.timezone,
			mentorName: sessionData.mentorFirstName + ' ' + sessionData.mentorLastName,
			duration: sessionData.sTypeDuration,
			sessionId: sessionData.session.id,
			type: sessionData.sTypeName,
			facilityName: PUBLIC_FACILITY_NAME,
			emailDomain: ARTCC_EMAIL_DOMAIN,
			cancelationReason: 'Not Specified',
			cancelationUserLevel: ROLE_STUDENT
		};

		const studentEmailContent = appointment_canceled({ ...emailContent, student: true });
		const mentorEmailContent = appointment_canceled({ ...emailContent, student: false });

		try {
			await sendEmail(
				user.email,
				'Appointment canceled' +
					DateTime.fromISO(sessionData.session.start)
						.setZone(sessionData.session.timezone)
						.toLocaleString(DateTime.DATETIME_HUGE),
				studentEmailContent.raw,
				studentEmailContent.html
			);

			await sendEmail(
				sessionData.mentorEmail,
				'Session canceled' +
					DateTime.fromISO(sessionData.session.start)
						.setZone(sessionData.session.timezone)
						.toLocaleString(DateTime.DATETIME_HUGE),
				mentorEmailContent.raw,
				mentorEmailContent.html
			);
		} catch (e) {
			console.error(e);
		}

		await db.delete(sessions).where(eq(sessions.id, event.params.id));
	}
};
