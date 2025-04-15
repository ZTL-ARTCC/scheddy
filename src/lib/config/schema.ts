export const baseConfig = {
	database: {
		url: 'mysql://ztl:ztl@localhost:3307/scheddy'
	},
	facility: {
		name_public: 'Your ARTCC',
		id: 'ZXX',
		mail_domain: 'zxxartcc.org'
	},
	site: {
		base_public: 'http://localhost:5173',
		mode: 'dev',
		dev_cid: 'TO_BE_OVERRIDDEN'
	},
	bookings: {
		max_days_ahead: 14,
		max_pending_sessions: 2
	},
	api: {
		master_key: 'this must be overridden'
	},
	auth: {
		vatsim: {
			base_public: 'https://auth-dev.vatsim.net',
			client_id_public: 'your_client_id',
			client_secret: 'secret'
		},
		vatusa: {
			base: 'https://api.vatusa.net',
			key: 'key'
		}
	},
	smtp: {
		host: 'mail.yourdomain.net',
		port: 465,
		secure: true,
		auth: {
			user: 'you',
			pass: 'pwd'
		},
		from: 'Scheddy Test Server <sts@yourdomain.dev>'
	},
	metrics: {
		dsn_public: 'https://ce463d975d42f1a39ec94cbf87405e46@sentry.coredoes.dev/2'
	}
};

// eslint-disable-next-line
export function recursiveKeepPublic(config: any, current_key: string): any {
	const copy = structuredClone(config);
	for (const key of Object.keys(config)) {
		const this_key = current_key + '_' + key;
		if (typeof config[key] === 'object') {
			copy[key] = recursiveKeepPublic(config[key], this_key);
		} else {
			if (!key.endsWith('_public')) {
				delete copy[key];
			}
		}
	}
	return copy;
}

// eslint-disable-next-line
export function recursiveOverlayConfig(config: any, current_key: string, env: any): any {
	const copy = structuredClone(config);
	for (const key of Object.keys(config)) {
		const this_key = current_key + '_' + key;
		if (typeof config[key] === 'object') {
			copy[key] = recursiveOverlayConfig(config[key], this_key, env);
		} else {
			let env_var = this_key.toUpperCase();

			if (env_var.endsWith('_PUBLIC')) {
				env_var = 'PUBLIC_' + env_var.replace('_PUBLIC', ''); // move the PUBLIC postfix to a prefix
			}

			if (!Object.keys(env).includes(env_var)) {
				continue;
			}
			const encoded_value = env[env_var];
			if (encoded_value !== undefined) {
				// override base configuration

				if (typeof config[key] === 'string') {
					copy[key] = encoded_value;
					continue;
				}
				if (typeof config[key] === 'number') {
					copy[key] = Number.parseInt(encoded_value);
					continue;
				}

				const value = JSON.parse(encoded_value);
				if (typeof value != typeof config[key]) {
					throw new Error(
						`Invalid overlay configuration in ${env_var}: expected ${typeof config[key]} found ${typeof value}`
					);
				}
			}
		}
	}
	return copy;
}
