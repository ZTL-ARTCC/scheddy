import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { verifyToken } from '$lib/helpers/verifyApiToken';

export const GET: RequestHandler = async ({ request, params }) => {
	verifyToken(request.headers.get('Authorization'));

	const sess = await db
		.select()
		.from(sessions)
		.leftJoin(mentors, eq(sessions.mentor, mentors.id))
		.leftJoin(sessionTypes, eq(sessions.type, sessionTypes.id))
		.where(and(eq(sessions.mentor, params.trainerId), eq(sessions.cancelled, false)))
		.orderBy(desc(sessions.start));

	// return all sessions with the start date up to 24h in the past
	const filtered = sess.filter((u) => {
		const sessionStart = DateTime.fromISO(u.session.start);
		const now = DateTime.now();
		return sessionStart >= now.minus({ hours: 24 }) && sessionStart <= now.plus({ minutes: 30 });
	});

	return new Response(JSON.stringify(filtered));
};
