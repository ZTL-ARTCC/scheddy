import { defineConfig } from 'drizzle-kit';
if (!process.env.SCHEDDY_DATABASE_URL) throw new Error('SCHEDDY_DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',

	dbCredentials: {
		url: process.env.SCHEDDY_DATABASE_URL
	},

	verbose: true,
	strict: true,
	dialect: 'mysql'
});
