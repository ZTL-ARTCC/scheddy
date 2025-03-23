import { db } from '$lib/server/db';
import { sessions, sessionTypes, students, mentors } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { sendEmail } from '$lib/email';
import { reminder } from '$lib/emails/student/reminder';
import { PUBLIC_FACILITY_NAME } from '$env/static/public';
import { ARTCC_EMAIL_DOMAIN } from '$env/static/private';

export async function GET() {
	const sess = await db
		.select()
		.from(sessions)
		.leftJoin(mentors, eq(mentors.id, sessions.mentor))
		.leftJoin(students, eq(students.id, sessions.student))
		.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
		.where(eq(sessions.reminded, false));

	const sessWithin24h = sess.filter((u) => {
		return DateTime.fromISO(u.session.start) <= DateTime.now().plus({ hours: 24 });
	});

	for (const sess of sessWithin24h) {
		const studentEmailContent = reminder({
			startTime: DateTime.fromISO(sess.session.start).setZone(sess.session.timezone),
			timezone: sess.session.timezone,
			sessionId: sess.session.id,
			type: sess.sessionType.name,
			mentorName: sess.mentor.firstName + ' ' + sess.mentor.lastName,
			facilityName: PUBLIC_FACILITY_NAME,
			emailDomain: ARTCC_EMAIL_DOMAIN
		});

		await sendEmail(
			sess.student.email,
			'Session reminder - ' +
				DateTime.fromISO(sess.session.start)
					.setZone(sess.session.timezone)
					.toLocaleString(DateTime.DATETIME_HUGE),
			studentEmailContent.raw,
			studentEmailContent.html
		);

		await db
			.update(sessions)
			.set({
				reminded: true
			})
			.where(eq(sessions.id, sess.session.id));
	}

	console.log('[sendReminderEmails] Sent ' + sessWithin24h.length + ' reminder emails');

	return new Response(JSON.stringify({ ok: true }));
}
