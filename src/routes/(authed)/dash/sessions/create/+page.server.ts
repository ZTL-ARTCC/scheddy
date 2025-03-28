import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { ROLE_MENTOR, ROLE_STAFF } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, sessionTypes, users } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { DateTime } from 'luxon';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createSchema } from './createSchema';
import { ulid } from 'ulid';
import { appointment_booked } from '$lib/emails/student/appointment_booked';
import { PUBLIC_FACILITY_NAME } from '$env/static/public';
import { ARTCC_EMAIL_DOMAIN } from "$env/static/private";
import { sendEmail } from '$lib/email';
import { getTimeZones } from '@vvo/tzdb';
import { new_session } from '$lib/emails/mentor/new_session';

export const load: PageServerLoad = async ({ cookies }) => {
	const { user } = (await loadUserData(cookies))!;

	if (roleOf(user) < ROLE_MENTOR) {
		redirect(307, '/schedule');
	}

	let sTypes: (typeof sessionTypes.$inferSelect)[];

	if (roleOf(user) >= ROLE_STAFF) {
		sTypes = await db.select().from(sessionTypes);
	} else {
		const allowedTypes: string[] = user.allowedSessionTypes
			? JSON.parse(user.allowedSessionTypes)
			: null;

		sTypes = await db.select().from(sessionTypes).where(inArray(sessionTypes.id, allowedTypes));
	}

	const typesMap: Record<string, { name: string; length: number }> = {};
	for (const type of sTypes) {
		typesMap[type.id] = type;
	}

	const u_users = await db.select().from(users);

	let dmentors: (typeof users.$inferSelect)[];

	if (roleOf(user) >= ROLE_STAFF) {
		dmentors = u_users.filter((u) => roleOf(u) >= ROLE_MENTOR);
	} else {
		dmentors = [user];
	}

	const mentorsMap: Record<
		number,
		{
			name: string;
			availability: string | null;
			timezone: string;
		}
	> = {};

	for (const user of dmentors) {
		mentorsMap[user.id] = {
			name: user.firstName + ' ' + user.lastName,
			availability: user.mentorAvailability,
			timezone: user.timezone ?? 'America/New York'
		};
	}

	const usersMap: Record<number, { name: string }> = {};
	for (const user of u_users) {
		usersMap[user.id] = { name: user.firstName + ' ' + user.lastName };
	}

	const data: typeof createSchema._type = {
		date: DateTime.now().toISODate(),
		hour: DateTime.now().hour,
		minute: DateTime.now().minute,
		type: sTypes.length === 0 ? '' : sTypes[0].id,
		mentor: user.id,
		student: u_users[0].id,
		timezone: mentorsMap[user.id].timezone
	};

	const form = await superValidate(data, zod(createSchema));

	const timezones = getTimeZones();
	timezones.sort((a, b) => {
		const nameA = a.name.toUpperCase();
		const nameB = b.name.toUpperCase();
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}

		return 0;
	});

	return {
		breadcrumbs: [
			{ title: 'Dashboard', url: '/dash' },
			{ title: 'Facility Calendar', url: '/dash/cal' },
			{ title: 'Create Session' }
		],
		form,
		typesMap,
		mentorsMap,
		usersMap,
		timezones
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;

		if (roleOf(user) < ROLE_MENTOR) {
			redirect(307, '/schedule');
		}

		const form = await superValidate(event, zod(createSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		let date = DateTime.fromISO(form.data.date, { zone: form.data.timezone });

		date = date.set({
			hour: form.data.hour,
			minute: form.data.minute
		});

		const id = ulid();

		await db.insert(sessions).values({
			id,
			mentor: form.data.mentor,
			student: form.data.student,
			start: date.toString(),
			type: form.data.type,
			timezone: form.data.timezone,
			createdBy: user.id,
			createdAt: DateTime.now().toISO()
		});

		const mentor = await db.select().from(users).where(eq(users.id, form.data.mentor));
		const student = await db.select().from(users).where(eq(users.id, form.data.student));
		const type = await db.select().from(sessionTypes).where(eq(sessionTypes.id, form.data.type));

		const studentEmailContent = appointment_booked({
			startTime: date,
			timezone: form.data.timezone,
			mentorName: mentor[0].firstName + ' ' + mentor[0].lastName,
			duration: type[0].length,
			sessionId: id,
			type: type[0].name,
			link_params: `?sessionId=${id}&reschedule=true&type=${form.data.type}`,
			reschedule: false,
			facilityName: PUBLIC_FACILITY_NAME,
			emailDomain: ARTCC_EMAIL_DOMAIN
		});

		const mentorEmailContent = new_session({
			startTime: date,
			timezone: form.data.timezone,
			studentName: student[0].firstName + ' ' + student[0].lastName,
			duration: type[0].length,
			sessionId: id,
			type: type[0].name,
			reschedule: false,
			facilityName: PUBLIC_FACILITY_NAME,
			emailDomain: ARTCC_EMAIL_DOMAIN
		});

		try {
			await sendEmail(
				student[0].email,
				'Appointment booked - ' +
					date.setZone(form.data.timezone).toLocaleString(DateTime.DATETIME_HUGE),
				studentEmailContent.raw,
				studentEmailContent.html
			);

			await sendEmail(
				mentor[0].email,
				'Session booked - ' +
					date.setZone(form.data.timezone).toLocaleString(DateTime.DATETIME_HUGE),
				mentorEmailContent.raw,
				mentorEmailContent.html
			);
		} catch (e) {
			console.error(e);
		}

		return { form };
	}
};
