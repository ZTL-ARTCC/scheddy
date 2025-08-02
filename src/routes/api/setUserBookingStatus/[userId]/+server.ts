import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { mentors, sessions, sessionTypes, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { verifyToken } from '$lib/helpers/verifyApiToken';

export const POST: RequestHandler = async ({ request, params }) => {
	verifyToken(request.headers.get('Authorization'));

	const { enabled } = await request.json();

	let r = await db
		.update(users)
		.set({
			allowBookings: enabled
		})
		.where(eq(users.id, params.userId));

	return new Response(JSON.stringify(r));
};
