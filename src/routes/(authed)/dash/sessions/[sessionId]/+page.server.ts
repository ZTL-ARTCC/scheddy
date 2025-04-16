import { loadUserData, type SessionAndFriends } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_STAFF } from '$lib/utils';
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
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { DateTime } from 'luxon';
import { session_transfer_result } from '$lib/emails/mentor/transfer_result';
import { sendEmail } from '$lib/email';
import { appointment_booked } from '$lib/emails/student/appointment_booked';
import { new_session } from '$lib/emails/mentor/new_session';
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

	const transfer = await db
		.select()
		.from(pendingTransfers)
		.where(eq(pendingTransfers.sessionId, sessionAndFriends.session.id));

	if (
		roleOf(user) < ROLE_STAFF &&
		!(
			user.id == sessionAndFriends.session.student ||
			user.id == sessionAndFriends.session.mentor ||
			user.id == transfer[0].newMentor
		)
	) {
		redirect(307, '/schedule');
	}

	const createdByUser = await db
		.select()
		.from(users)
		.where(eq(users.id, sessionAndFriends.session.createdBy!));

	const createdAt = sessionAndFriends.session.createdAt
		? DateTime.fromISO(sessionAndFriends.session.createdAt).toLocaleString(DateTime.DATETIME_FULL)
		: 'Not specified';

	const createdBy = sessionAndFriends.session.createdBy
		? `${createdByUser[0].firstName} ${createdByUser[0].lastName} at ${createdAt}`
		: 'Not specified';

	const pendingTransfer = Object.values(transfer).length > 0;

	const newMentor =
		pendingTransfer && (roleOf(user) >= ROLE_STAFF || transfer[0].newMentor === user.id);

	const now = DateTime.utc();
	const start = DateTime.fromISO(sessionAndFriends.session.start);
	const pastSession = now > start;

	return {
		sessionInfo: sessionAndFriends,
		isMentor: user.id == sessionAndFriends.session.mentor || roleOf(user) >= ROLE_STAFF,
		pastSession,
		pendingTransfer,
		newMentor,
		createdBy,
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Facility Calendar', url: '/dash/cal' },
			{ title: 'Session Information' }
		]
	};
};

export const actions: Actions = {
	accept: async ({ cookies, params }) => {
		const { user } = (await loadUserData(cookies))!;
		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, params.sessionId));
		const sessionAndFriends = sessionList[0] as unknown as SessionAndFriends;

		const transfer = await db
			.select()
			.from(pendingTransfers)
			.where(eq(pendingTransfers.sessionId, sessionAndFriends.session.id));

		if (roleOf(user) < ROLE_STAFF && !(user.id == transfer[0].newMentor)) {
			redirect(307, '/schedule');
		}

		const newMentor = await db.select().from(users).where(eq(users.id, transfer[0].newMentor));

		const studentEmailContent = appointment_booked({
			startTime: DateTime.fromISO(sessionAndFriends.session.start).setZone(
				sessionAndFriends.session.timezone
			),
			timezone: sessionAndFriends.session.timezone,
			mentorName: newMentor[0].firstName + ' ' + newMentor[0].lastName,
			duration: sessionAndFriends.sessionType?.length,
			sessionId: sessionAndFriends.session.id,
			type: sessionAndFriends.sessionType?.name,
			link_params: `?sessionId=${sessionAndFriends.session.id}&reschedule=true&type=${sessionAndFriends.sessionType?.id}`,
			reschedule: true,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain
		});

		const mentorEmailContent = new_session({
			startTime: DateTime.fromISO(sessionAndFriends.session.start).setZone(
				sessionAndFriends.session.timezone
			),
			timezone: sessionAndFriends.session.timezone,
			studentName: sessionAndFriends.student?.firstName + ' ' + sessionAndFriends.student?.lastName,
			duration: sessionAndFriends.sessionType?.length,
			sessionId: sessionAndFriends.session.id,
			type: sessionAndFriends.sessionType?.name,
			reschedule: false,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain
		});

		const oldMentorEmailContent = session_transfer_result({
			startTime: DateTime.fromISO(sessionAndFriends.session.start),
			timezone: sessionAndFriends.session.timezone,
			duration: sessionAndFriends.sessionType?.length,
			studentName: sessionAndFriends.student?.firstName + ' ' + sessionAndFriends.student?.lastName,
			mentorName: newMentor[0].firstName + ' ' + newMentor[0].lastName,
			sessionId: params.sessionId,
			type: sessionAndFriends.sessionType?.name,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain,
			result: 'accepted'
		});

		await sendEmail(
			sessionAndFriends.mentor.email,
			'Session transfer request accepted -' +
				DateTime.fromISO(sessionAndFriends.session.start)
					.setZone(sessionAndFriends.session.timezone)
					.toLocaleString(DateTime.DATETIME_HUGE),
			oldMentorEmailContent.raw,
			oldMentorEmailContent.html
		);

		await sendEmail(
			sessionAndFriends.student.email,
			'Appointment updated - ' +
				DateTime.fromISO(sessionAndFriends.session.start)
					.setZone(sessionAndFriends.session.timezone)
					.toLocaleString(DateTime.DATETIME_HUGE),
			studentEmailContent.raw,
			studentEmailContent.html
		);

		await sendEmail(
			newMentor[0].email,
			'Session booked - ' +
				DateTime.fromISO(sessionAndFriends.session.start)
					.setZone(sessionAndFriends.session.timezone)
					.toLocaleString(DateTime.DATETIME_HUGE),
			mentorEmailContent.raw,
			mentorEmailContent.html
		);

		await db
			.update(sessions)
			.set({
				mentor: transfer[0].newMentor
			})
			.where(eq(sessions.id, transfer[0].sessionId));

		await db.delete(pendingTransfers).where(eq(pendingTransfers.sessionId, transfer[0].sessionId));
	},
	decline: async ({ cookies, params }) => {
		const { user } = (await loadUserData(cookies))!;
		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, params.sessionId));
		const sessionAndFriends = sessionList[0] as unknown as SessionAndFriends;

		const transfer = await db
			.select()
			.from(pendingTransfers)
			.where(eq(pendingTransfers.sessionId, sessionAndFriends.session.id));

		if (roleOf(user) < ROLE_STAFF && !(user.id == transfer[0].newMentor)) {
			redirect(307, '/schedule');
		}

		const oldMentorEmailContent = session_transfer_result({
			startTime: DateTime.fromISO(sessionAndFriends.session.start),
			timezone: sessionAndFriends.session.timezone,
			duration: sessionAndFriends.sessionType?.length,
			studentName: sessionAndFriends.student?.firstName + ' ' + sessionAndFriends.student?.lastName,
			mentorName: sessionAndFriends.mentor.firstName + ' ' + sessionAndFriends.mentor.lastName,
			sessionId: params.sessionId,
			type: sessionAndFriends.sessionType?.name,
			facilityName: serverConfig.facility.name_public,
			emailDomain: serverConfig.facility.mail_domain,
			result: 'declined'
		});

		await sendEmail(
			sessionAndFriends.mentor.email,
			'Session transfer request declined -' +
				DateTime.fromISO(sessionAndFriends.session.start)
					.setZone(sessionAndFriends.session.timezone)
					.toLocaleString(DateTime.DATETIME_HUGE),
			oldMentorEmailContent.raw,
			oldMentorEmailContent.html
		);

		await db.delete(pendingTransfers).where(eq(pendingTransfers.sessionId, transfer[0].sessionId));
	},
	cancel: async ({ cookies, params }) => {
		const { user } = (await loadUserData(cookies))!;
		const sessionList = await db
			.select()
			.from(sessions)
			.leftJoin(sessionTypes, eq(sessionTypes.id, sessions.type))
			.leftJoin(mentors, eq(mentors.id, sessions.mentor))
			.leftJoin(students, eq(students.id, sessions.student))
			.where(eq(sessions.id, params.sessionId));
		const sessionAndFriends = sessionList[0] as unknown as SessionAndFriends;

		if (roleOf(user) < ROLE_STAFF && user.id != sessionAndFriends.session.mentor) {
			redirect(307, '/schedule');
		}

		await db
			.delete(pendingTransfers)
			.where(eq(pendingTransfers.sessionId, sessionAndFriends.session.id));
	}
};
