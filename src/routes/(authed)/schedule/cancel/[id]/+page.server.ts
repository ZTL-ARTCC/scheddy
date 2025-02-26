import type { PageServerLoad, Actions } from './$types';
import { loadUserData } from '$lib/userInfo';
import { ROLE_MENTOR, roleString } from '$lib/utils';
import { roleOf } from '$lib';
import { db } from '$lib/server/db';
import { sessions, sessionTypes, users } from '$lib/server/db/schema';
import { eq, gte, or } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { ulid } from 'ulid';
import { appointment_booked } from '$lib/emails/appointment_booked';
import { sendEmail } from '$lib/email';
import { new_session } from '$lib/emails/new_session';
import { slottificate } from '$lib/slottificate';
import { DateTime, Interval } from 'luxon';
import { MAX_PENDING_SESSIONS, ARTCC_EMAIL_DOMAIN } from '$env/static/private';
import { PUBLIC_FACILITY_NAME } from "$env/static/public";
import { z } from 'zod';
import { superValidate, message, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getTimeZones } from '@vvo/tzdb';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const { user } = (await loadUserData(cookies))!;

	const session = (await db.select().from(sessions).where(eq(sessions.id, params.id)))[0];

	if (session.student != user.id) {
		return redirect(307, '/schedule');
	}

	return { user,
		role: roleString(roleOf(user)), };
}

export const actions: Actions = {
	default: async (event) => {
		const { user } = (await loadUserData(event.cookies))!;

		const session = (await db.select().from(sessions).where(eq(sessions.id, event.params.id)))[0];

		if (session.student != user.id) {
			return redirect(307, '/schedule');
		}

		await db.delete(sessions).where(eq(sessions.id, event.params.id));
	}
}