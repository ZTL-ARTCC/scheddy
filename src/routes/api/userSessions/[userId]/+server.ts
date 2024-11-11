import type { RequestHandler } from "./$types";
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { API_MASTER_KEY } from "$env/static/private";
import { DateTime } from 'luxon';

export const GET: RequestHandler = async ({ request, params }) => {
	let token = request.headers.get("Authorization");
	if (!token) {
		error(403, JSON.stringify({
			ok: false,
			error: "access denied (#3fa1)"
		}));
	}

	if (!token.includes("Bearer")) {
		error(403, JSON.stringify({
			ok: false,
			error: "access denied (#6ab3)"
		}));
	}

	let token_parts = token.split(" ");
	if (token_parts.length != 2) {
		error(403, JSON.stringify({
			ok: false,
			error: "access denied (#5a17)"
		}));
	}

	let real_token = token_parts[1];
	if (real_token != API_MASTER_KEY) {
		error(403, JSON.stringify({
			ok: false,
			error: "access denied (#17ab)"
		}));
	}

	let sess = await db.select()
		.from(sessions)
		.where(eq(sessions.student, params.id));


	// return all sessions with the start date up to 24h in the past
	let filtered = sess.filter((u) => {
		return DateTime.fromISO(u.start) >= DateTime.now().minus({ hours: 24 });
	});

	return new Response(JSON.stringify(filtered));
}