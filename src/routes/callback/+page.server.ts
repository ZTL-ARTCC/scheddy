import type { PageServerLoad } from './$types';
import {
	PUBLIC_FACILITY_NAME,
	PUBLIC_VATSIM_OAUTH_BASE,
	PUBLIC_VATSIM_OAUTH_CLIENT_ID,
	PUBLIC_VATSIM_OAUTH_REDIRECT_URL
} from '$env/static/public';
import {
	VATSIM_OAUTH_CLIENT_SECRET,
	VATUSA_API_BASE,
	VATUSA_FACILITY_ID,
	VATUSA_API_KEY
} from '$env/static/private';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { userTokens, users } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { redirect } from '@sveltejs/kit';
import { ROLE_DEVELOPER, ROLE_STAFF, ROLE_MENTOR, ROLE_STUDENT } from '$lib/utils';

export const load: PageServerLoad = async ({ cookies, url, fetch }) => {
	if (url.searchParams.has('error')) {
		const error_code: string = url.searchParams.get('error')!;
		const error_description: string = url.searchParams.get('error_description')!;
		const error_message: string = url.searchParams.get('message')!;

		return {
			success: false,
			error_code,
			error_description,
			error_message
		};
	}

	const code = url.searchParams.get('code');
	if (!code) {
		return {
			success: false,
			error_code: 'no_auth_code',
			error_description: "No auth code was present in VATSIM's response.",
			error_message: "No auth code was present in VATSIM's response."
		};
	}

	const request_body = new URLSearchParams();
	request_body.set('grant_type', 'authorization_code');
	request_body.set('client_id', PUBLIC_VATSIM_OAUTH_CLIENT_ID);
	request_body.set('client_secret', VATSIM_OAUTH_CLIENT_SECRET);
	request_body.set('redirect_uri', PUBLIC_VATSIM_OAUTH_REDIRECT_URL);
	request_body.set('code', code);
	request_body.set('scope', '');

	const token_response = await fetch(`${PUBLIC_VATSIM_OAUTH_BASE}/oauth/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: request_body.toString()
	});

	const resp = await token_response.json();

	if (!token_response.ok) {
		return {
			success: false,
			error_code: resp.error,
			error_description: resp.error_description,
			error_message: resp.hint
		};
	}

	const token = resp.access_token;
	// we got an access token
	// get the CID now

	const user_data_resp = await fetch(`${PUBLIC_VATSIM_OAUTH_BASE}/api/user`, {
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!user_data_resp.ok) {
		return {
			success: false,
			error_code: 'user_data_failed',
			error_description: 'Failed to load user data from VATSIM.',
			error_message: 'Failed to load user data from VATSIM.'
		};
	}

	const user_data_str = await user_data_resp.text();
	const user_data = JSON.parse(user_data_str);

	let cid = user_data.data.cid;
	// DEVELOPMENT: Overwrites the CID for the data request with one in the .env file
	if (env.DEVELOPMENT_CID) {
		cid = env.DEVELOPMENT_CID;
	}

	// finally, load the division data from VATUSA
	const vatusa_user_resp = await fetch(`${VATUSA_API_BASE}/user/${cid}?apikey=${VATUSA_API_KEY}`, {
		headers: {
			Authorization: `Bearer ${VATUSA_API_KEY}`
		}
	});

	if (!vatusa_user_resp.ok) {
		return {
			success: false,
			error_code: 'vatusa_data_failed',
			error_description: 'Failed to load user data from VATUSA.',
			error_message: 'Failed to load user data from VATUSA.'
		};
	}

	const vatusa_info = await vatusa_user_resp.json();

	let highest_role = 0;

	// If they're a home controller, give them student perms
	if (vatusa_info.data.facility == VATUSA_FACILITY_ID) {
		if (ROLE_STUDENT > highest_role) {
			highest_role = ROLE_STUDENT;
		}
	}

	// If they're a visiting controller, give them student perms
	for (const visiting_facility of vatusa_info.data.visiting_facilities) {
		if (visiting_facility.facility == VATUSA_FACILITY_ID && ROLE_STUDENT > highest_role) {
			highest_role = ROLE_STUDENT;
		}
	}

	// Assign staff roles
	// WM: 							ROLE_DEVELOPER
	// ATM, DATM, TA: 	ROLE_STAFF
	// INS, MTR: 				ROLE_MENTOR
	for (const role of vatusa_info.data.roles) {
		if (role.facility == VATUSA_FACILITY_ID) {
			let this_role = 0;
			if (role.role == 'WM') {
				this_role = ROLE_DEVELOPER;
			} else if (role.role == 'ATM' || role.role == 'DATM' || role.role == 'TA') {
				this_role = ROLE_STAFF;
			} else if (role.role == 'INS' || role.role == 'MTR') {
				this_role = ROLE_MENTOR;
			}

			if (this_role > highest_role) {
				highest_role = this_role;
			}
		}
	}

	// User must be at least a ROLE_STUDENT to log in
	if (highest_role < ROLE_STUDENT) {
		return {
			success: false,
			error_code: 'not_a_student',
			error_description: `You do not appear to be a student or training staff member of the ${PUBLIC_FACILITY_NAME}. If you believe you are receiving this message in error, please contact your facility staff.`,
			error_message: `You do not appear to be a student or training staff member of the ${PUBLIC_FACILITY_NAME}. If you believe you are receiving this message in error, please contact your facility staff.`
		};
	}

	await db
		.insert(users)
		.values({
			id: cid,
			firstName: vatusa_info.data.fname,
			lastName: vatusa_info.data.lname,
			email: vatusa_info.data.email,
			role: highest_role,
			roleOverride: 0,
			isVisitor: vatusa_info.data.facility != VATUSA_FACILITY_ID,
			rating: vatusa_info.data.rating,
			timezone: 'America/New_York',
			mentorAvailability: 'null',
			allowedSessionTypes: 'null'
		})
		.onDuplicateKeyUpdate({
			set: {
				id: cid,
				firstName: vatusa_info.data.fname,
				lastName: vatusa_info.data.lname,
				email: vatusa_info.data.email,
				role: highest_role,
				isVisitor: vatusa_info.data.facility != VATUSA_FACILITY_ID,
				rating: vatusa_info.data.rating
			}
		});

	const utoken = nanoid();
	await db.insert(userTokens).values({
		id: utoken,
		user: cid
	});

	cookies.set('scheddy_token', utoken, { path: '/', httpOnly: false });

	redirect(307, '/schedule');
};
