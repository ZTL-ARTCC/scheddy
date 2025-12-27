import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { verifyToken } from '$lib/helpers/verifyApiToken';

export const GET: RequestHandler = async ({ request }) => {
	verifyToken(request.headers.get('Authorization'));

	const sess = await db
		.select()
		.from(sessions)
		.leftJoin(mentors, eq(sessions.mentor, mentors.id))
		.leftJoin(sessionTypes, eq(sessions.type, sessionTypes.id))
		.where(eq(sessions.cancelled, false));

	// return all sessions with the start date up to 24h in the past
	const filtered = sess.filter((u) => {
		return DateTime.fromISO(u.session.start) >= DateTime.now().minus({ hours: 24 });
	});

	return new Response(JSON.stringify(filtered));
};
