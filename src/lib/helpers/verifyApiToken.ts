import { error } from '@sveltejs/kit';
import { serverConfig } from '$lib/config/server';

export const verifyToken = (token) => {
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
	if (real_token != serverConfig.api.master_key) {
		error(
			403,
			JSON.stringify({
				ok: false,
				error: 'access denied (#17ab)'
			})
		);
	}
};
