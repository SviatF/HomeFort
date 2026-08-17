const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qfpwpqflqiwjqpojmngy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_e2MOTmx3ClUnCAnD5-2zIA_3Lv_Voil';

export async function callAdminRpc(name, payload = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.error || `Admin database error (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export const ADMIN_SESSION_COOKIE = 'domera_admin_session';
