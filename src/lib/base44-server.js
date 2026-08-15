import 'server-only';
import { createClient } from '@base44/sdk';

let client;

export function getBase44ServerClient() {
  if (client) return client;
  const appId = process.env.BASE44_APP_ID || process.env.NEXT_PUBLIC_BASE44_APP_ID;
  if (!appId) return null;
  client = createClient({ appId });
  return client;
}

export async function filterEntity(entityName, filter) {
  const api = getBase44ServerClient();
  if (!api) return [];
  try { return (await api.entities[entityName].filter(filter)) || []; }
  catch (error) { console.error(`[base44-server] ${entityName}.filter failed`, error); return []; }
}

export async function listEntity(entityName, order = '-updated_date', limit = 200) {
  const api = getBase44ServerClient();
  if (!api) return [];
  try { return (await api.entities[entityName].list(order, limit)) || []; }
  catch (error) { console.error(`[base44-server] ${entityName}.list failed`, error); return []; }
}
