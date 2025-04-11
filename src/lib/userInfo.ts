import { type Cookies, redirect } from '@sveltejs/kit';
import { sessions, users, userTokens, sessionTypes } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export interface UserData {
	user: typeof users.$inferSelect;
	userToken: typeof userTokens.$inferSelect;
}

export interface SessionAndFriends {
	student: typeof users.$inferSelect;
	mentor: typeof users.$inferSelect;
	session: typeof sessions.$inferSelect;
	sessionType: typeof sessionTypes.$inferSelect;
}

function condFail(a: boolean): null {
	if (a) return null;
	redirect(307, '/');
}

export async function loadUserData(
	cookies: Cookies,
	allowLoggedOut = false
): Promise<UserData | null> {
	const token = cookies.get('scheddy_token');
	if (!token) {
		return condFail(allowLoggedOut);
	}

	const returnedUsers = await db
		.select()
		.from(userTokens)
		.leftJoin(users, eq(userTokens.user, users.id))
		.where(eq(userTokens.id, token));

	if (returnedUsers.length == 0) {
		return condFail(allowLoggedOut);
	}

	const userAndToken = returnedUsers[0];

	if (!userAndToken) {
		return condFail(allowLoggedOut);
	}
	if (!userAndToken.user) {
		return condFail(allowLoggedOut);
	}

	return {
		user: userAndToken.user,
		userToken: userAndToken.userToken
	};
}
