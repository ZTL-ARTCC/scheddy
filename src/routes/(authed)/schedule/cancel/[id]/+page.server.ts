import type { PageServerLoad, Actions } from './$types';
import { loadUserData, type SessionAndFriends } from '$lib/userInfo';
import { ROLE_STUDENT, roleString } from '$lib/utils';
import { roleOf } from '$lib';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, students } from '$lib/server/db/schema';
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

		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, event.params.id));
		const sessionAndFriends = sessionList[0] as unknown as SessionAndFriends;

		if (sessionAndFriends.session.student != user.id) {
			return redirect(307, '/schedule');
		}

		const studentEmailContent = appointment_canceled({
			startTime: DateTime.fromISO(sessionAndFriends.session.start),
			timezone: sessionAndFriends.session.timezone,
			mentorName: sessionAndFriends.mentor?.firstName + ' ' + sessionAndFriends.mentor?.lastName,
			duration: sessionAndFriends.sessionType?.length ?? 0,
			sessionId: sessionAndFriends.session.id,
			type: sessionAndFriends.sessionType?.name,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain,
			cancellationReason: 'Not Specified',
			cancellationUserLevel: ROLE_STUDENT
		});

		const mentorEmailContent = session_canceled({
			startTime: DateTime.fromISO(sessionAndFriends.session.start),
			timezone: sessionAndFriends.mentor?.timezone,
			studentName:
				sessionAndFriends.student?.firstName + ' ' + sessionAndFriends.student?.firstName,
			duration: sessionAndFriends.sessionType?.length ?? 0,
			sessionId: sessionAndFriends.session.id,
			type: sessionAndFriends.sessionType?.name,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain,
			cancellationReason: 'Not Specified',
			cancellationUserLevel: ROLE_STUDENT
		});

		try {
			await sendEmail(
				sessionAndFriends.student?.email,
				'Appointment canceled - ' +
					DateTime.fromISO(sessionAndFriends.session.start)
						.setZone(sessionAndFriends.session.timezone)
						.toLocaleString(DateTime.DATETIME_HUGE),
				studentEmailContent.raw,
				studentEmailContent.html
			);

			await sendEmail(
				sessionAndFriends.mentor?.email,
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
				cancellationUserLevel: ROLE_STUDENT,
				cancellationReason: 'Not Specified'
			})
			.where(eq(sessions.id, event.params.id));
	}
};
