import { baseConfig, recursiveOverlayConfig } from '$lib/config/schema';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const serverConfig: typeof baseConfig = recursiveOverlayConfig(baseConfig, 'scheddy', { ...privateEnv, ...publicEnv });