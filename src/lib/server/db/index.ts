import { drizzle } from 'drizzle-orm/mysql2';
import { serverConfig } from '$lib/config/server';

export const db = drizzle(serverConfig.database.url);
