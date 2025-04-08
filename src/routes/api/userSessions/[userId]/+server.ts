import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { API_MASTER_KEY } from '$env/static/private';
import { DateTime } from 'luxon';

export const GET: RequestHandler = async ({ request, params }) => {
	const token = request.headers.get('Authorization');
	if (!token) {
		error(
			403,
			JSON.stringify({
				ok: false,
				error: 'access denied (#3fa1)'
			})
		);
	}

	if (!token.includes('Bearer')) {
		error(
			403,
			JSON.stringify({
				ok: false,
				error: 'access denied (#6ab3)'
			})
		);
	}

	const token_parts = token.split(' ');
	if (token_parts.length != 2) {
		error(
			403,
			JSON.stringify({
				ok: false,
				error: 'access denied (#5a17)'
			})
		);
	}

	const real_token = token_parts[1];
	if (real_token != API_MASTER_KEY) {
		error(
			403,
			JSON.stringify({
				ok: false,
				error: 'access denied (#17ab)'
			})
		);
	}

	const sess = await db
		.select()
		.from(sessions)
		.leftJoin(mentors, eq(sessions.mentor, mentors.id))
		.leftJoin(sessionTypes, eq(sessions.type, sessionTypes.id))
		.where(and(eq(sessions.student, params.userId), eq(sessions.cancelled, false)));

	// return all sessions with the start date up to 24h in the past
	const filtered = sess.filter((u) => {
		return DateTime.fromISO(u.session.start) >= DateTime.now().minus({ hours: 24 });
	});

	return new Response(JSON.stringify(filtered));
};
