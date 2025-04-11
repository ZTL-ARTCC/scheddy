import { baseConfig, recursiveKeepPublic, recursiveOverlayConfig } from '$lib/config/schema';
import { env } from '$env/dynamic/public';

export const clientConfig: typeof baseConfig = recursiveOverlayConfig(recursiveKeepPublic(baseConfig, 'scheddy'), 'scheddy', env);