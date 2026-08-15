import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const config = { appId: appParams.appId };
if (appParams.token) config.token = appParams.token;

export const base44 = createClient(config);
