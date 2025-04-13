import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { ROLE_MENTOR, ROLE_STUDENT, roleString } from '$lib/utils';
import { roleOf } from '$lib';
import { db } from '$lib/server/db';
import { sessions, sessionTypes, users } from '$lib/server/db/schema';
import { eq, gte, or } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { ulid } from 'ulid';
import { appointment_booked } from '$lib/emails/student/appointment_booked';
import { session_canceled } from '$lib/emails/mentor/session_canceled';
import { sendEmail } from '$lib/email';
import { new_session } from '$lib/emails/mentor/new_session';
import { slottificate } from '$lib/slottificate';
import { DateTime, Interval } from 'luxon';
import { MAX_PENDING_SESSIONS, ARTCC_EMAIL_DOMAIN, BASE_URL } from '$env/static/private';
import { PUBLIC_FACILITY_NAME } from '$env/static/public';
import { z } from 'zod';
import { superValidate, message, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getTimeZones } from '@vvo/tzdb';
import * as ics from 'ics';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const { user } = (await loadUserData(cookies))!;

	const sTypes = await db.select().from(sessionTypes);
	const mMentors = await db
		.select()
		.from(users)
		.where(or(gte(users.role, ROLE_MENTOR), gte(users.roleOverride, ROLE_MENTOR)));
	const allSessions = await db.select().from(sessions).where(eq(sessions.cancelled, false));

	let slotData;
	let atMaxSessions;
	// count the pending sessions for the student
	const now = DateTime.utc();

	const pendingForStudent = allSessions.filter(
		(session) => session.student === user.id && DateTime.fromISO(session.start) > now
	).length;

	const timezones = getTimeZones();
	timezones.sort((a, b) => {
		const nameA = a.name.toUpperCase(); // ignore upper and lowercase
		const nameB = b.name.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}

		// names must be equal
		return 0;
	});

	const schema = z.object({
		sessionType: z.enum(['', ...sTypes.map((u) => u.id)]),
		slot: z.string(),
		timezone: z.enum(timezones.map((u) => u.name))
	});

	const data = {};
	if (url.searchParams.has('sessionId')) {
		const id = url.searchParams.get('sessionId');
		const session = (await db.select().from(sessions).where(eq(sessions.id, id)))[0];
		if (!DateTime.fromISO(session.start).diffNow(['hours']).hours < 24) {
			data.sessionType = session.type;
			data.timezone = session.timezone;
		}
	}

	const maxPending = Number.parseInt(MAX_PENDING_SESSIONS);
	if (maxPending > 0 && pendingForStudent >= maxPending && !url.searchParams.has('sessionId')) {
		// don't allow the student to book any more sessions
		slotData = {};
		atMaxSessions = true;
	} else {
		slotData = slottificate(sTypes, mMentors, allSessions);
		atMaxSessions = false;
	}

	const form = await superValidate(data, zod(schema));

	const categories: { category: string; items: { id: string; name: string; order: number }[] }[] =
		[];

	sTypes.sort((a, b) => {
		return a.order - b.order;
	});

	const sessionMap: Record<string, { name: string; length: number }> = {};

	for (const sessionType of sTypes) {
		sessionMap[sessionType.id] = sessionType;

		if (categories.length === 0) {
			categories.push({
				category: sessionType.category,
				items: [sessionType]
			});
		} else {
			const last = categories[categories.length - 1];
			if (last.category === sessionType.category) {
				categories[categories.length - 1].items.push(sessionType);
			} else {
				categories.push({
					category: sessionType.category,
					items: [sessionType]
				});
			}
		}
	}

	return {
		user,
		role: roleString(roleOf(user)),
		sessionTypes: sTypes.filter((u) => u.rating >= user.rating),
		categories,
		slotData,
		atMaxSessions,
		form,
		sessionMap,
		timezones,
		reschedule: url.searchParams.has('sessionId'),
		oldId: url.searchParams.get('sessionId')
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;

		const sTypes = await db.select().from(sessionTypes).where(eq(sessionTypes.bookable, true));
		const mMentors = await db
			.select()
			.from(users)
			.where(or(gte(users.role, ROLE_MENTOR), gte(users.roleOverride, ROLE_MENTOR)));
		const allSessions = await db.select().from(sessions).where(eq(sessions.cancelled, false));

		const slotData = slottificate(sTypes, mMentors, allSessions);

		const timezones = getTimeZones();

		const schema = z.object({
			sessionType: z
				.enum(['', ...sTypes.map((u) => u.id)])
				.refine((typ) => typ != '', 'No type specified'),
			slot: z.string(),
			timezone: z.enum(timezones.map((u) => u.name))
		});

		const form = await superValidate(event, zod(schema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		if (!slotData[form.data.sessionType]) {
			return setError(form, 'sessionType', 'Session type does not exist.');
		}

		console.log(slotData);

		const slotObj = {
			slot: form.data.slot.split('@')[0],
			mentor: Number.parseInt(form.data.slot.split('@')[1])
		};
		const availableSlots = slotData[form.data.sessionType];

		console.log(availableSlots);

		let slotStillAvailable = false;
		for (const availSlot of availableSlots) {
			console.log(availSlot, slotObj);
			if (availSlot.slot === slotObj.slot && availSlot.mentor == slotObj.mentor) {
				slotStillAvailable = true;
			}
		}

		if (!slotStillAvailable) {
			return setError(form, 'slot', 'Slot is no longer available. Please choose another.');
		}

		const interval = Interval.fromISO(slotObj.slot);
		const start = interval.start.setZone('utc');

		const mentor = (await db.select().from(users).where(eq(users.id, slotObj.mentor)))[0]!;

		let duration = 0;
		let typename = '';
		for (const typ of sTypes) {
			if (typ.id === form.data.sessionType) {
				duration = typ.length;
				typename = typ.name;
			}
		}

		const id = ulid();

		const oldId = event.url.searchParams.get('sessionId');
		const oldSession = allSessions.find((s) => s.id === oldId);
		const oldSessionData = oldId
			? {
					session: oldSession,
					mentor: mMentors.find((m) => m.id === oldSession?.mentor),
					student: (await db.select().from(users).where(eq(users.id, oldSession?.student)))[0]
				}
			: null;

		const studentEmailContent = appointment_booked({
			startTime: start.setZone(form.data.timezone),
			timezone: form.data.timezone,
			mentorName: mentor.firstName + ' ' + mentor.lastName,
			duration,
			sessionId: id,
			type: typename,
			link_params: `?sessionId=${id}&reschedule=true&type=${form.data.sessionType}`,
			reschedule: oldId != undefined,
			facilityName: PUBLIC_FACILITY_NAME,
			emailDomain: ARTCC_EMAIL_DOMAIN
		});

		let mentorReschedule = false;

		if (oldId && oldSessionData && oldSessionData.mentor.id === slotObj.mentor) {
			mentorReschedule = true;
		}

		const mentorEmailContent = new_session({
			startTime: start.setZone(mentor.timezone),
			timezone: mentor.timezone,
			studentName: user.firstName + ' ' + user.lastName,
			duration,
			sessionId: id,
			type: typename,
			reschedule: mentorReschedule,
			facilityName: PUBLIC_FACILITY_NAME,
			emailDomain: ARTCC_EMAIL_DOMAIN
		});

		if (oldId == undefined) {
			await db.insert(sessions).values({
				id,
				mentor: slotObj.mentor,
				student: user.id,
				start: start.toISO(),
				type: form.data.sessionType,
				timezone: form.data.timezone,
				createdBy: user.id,
				createdAt: DateTime.now().toISO()
			});
		} else {
			await db
				.update(sessions)
				.set({
					start: start.toISO(),
					timezone: form.data.timezone,
					mentor: slotObj.mentor
				})
				.where(eq(sessions.id, oldId));
		}

		const icsEvent = (await new Promise((res, rej) => {
			const startUtc = start.setZone('utc');
			ics.createEvent(
				{
					start: [startUtc.year, startUtc.month, startUtc.day, startUtc.hour, startUtc.minute],
					startInputType: 'utc',
					duration: { hours: Math.floor(duration / 60), minutes: duration % 60 },
					title: `${PUBLIC_FACILITY_NAME} Training Session`,
					description: `${typename} with ${mentor.firstName} ${mentor.lastName} and ${user.firstName} ${user.lastName}`,
					url: BASE_URL
				},
				(err: any, val: any) => {
					if (err) {
						rej(err);
					}
					res(val);
				}
			);
		})) as string;

		try {
			await sendEmail(
				user.email,
				`Appointment ${oldId ? 'rescheduled' : 'booked'} - ` +
					start.setZone(form.data.timezone).toLocaleString(DateTime.DATETIME_HUGE),
				studentEmailContent.raw,
				studentEmailContent.html,
				icsEvent
			);

			await sendEmail(
				mentor.email,
				`Session ${oldSessionData?.mentor?.id === slotObj.mentor ? 'rescheduled' : 'booked'} - ` +
					start.setZone(mentor.timezone).toLocaleString(DateTime.DATETIME_HUGE),
				mentorEmailContent.raw,
				mentorEmailContent.html,
				icsEvent
			);

			if (oldSessionData && oldSessionData.mentor && oldSessionData.mentor?.id !== slotObj.mentor) {
				const oldMentorEmailContent = session_canceled({
					startTime: DateTime.fromISO(oldSessionData.session?.start).setZone(
						oldSessionData.mentor.timezone
					),
					type: typename,
					duration,
					studentName: oldSessionData.student.firstName + ' ' + oldSessionData.student.lastName,
					sessionId: oldId,
					timezone: oldSessionData.mentor?.timezone,
					facilityName: PUBLIC_FACILITY_NAME,
					emailDomain: ARTCC_EMAIL_DOMAIN,
					cancellationReason: 'Student Rescheduled',
					cancellationUserLevel: ROLE_STUDENT
				});

				await sendEmail(
					oldSessionData.mentor.email,
					'Session canceled - ' +
						DateTime.fromISO(oldSessionData.session?.start)
							.setZone(oldSessionData.mentor.timezone)
							.toLocaleString(DateTime.DATETIME_HUGE),
					oldMentorEmailContent.raw,
					oldMentorEmailContent.html
				);
			}
		} catch (e) {
			console.error(e); // TODO: requeue these for later
		}

		return message(
			form,
			"Session booked 🥳 You'll receive a confirmation email shortly and you should see the session on your dashboard soon."
		);
	}
};
