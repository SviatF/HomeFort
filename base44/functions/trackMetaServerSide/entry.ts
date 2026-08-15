import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

async function sha256(value) {
  const data = new TextEncoder().encode(String(value).trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default async function (req) {
  try {
    const pixelId = process.env.META_PIXEL_ID;
    const token = process.env.META_ACCESS_TOKEN;
    if (!pixelId || !token || pixelId === 'YOUR_PIXEL_ID') {
      return Response.json({ ok: true, skipped: 'no_credentials' });
    }

    const body = await req.json().catch(() => ({}));
    const { event_name, event_data = {}, user_data = {}, event_id } = body;

    const userData = {};
    if (user_data.email) userData.em = await sha256(user_data.email);
    if (user_data.phone) userData.ph = await sha256(user_data.phone.replace(/[^\d+]/g, ''));
    if (user_data.first_name) userData.fn = await sha256(user_data.first_name);
    if (user_data.city) userData.ct = await sha256(user_data.city);
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ua = req.headers.get('user-agent');
    if (ip) userData.client_ip_address = ip;
    if (ua) userData.client_user_agent = ua;

    const payload = {
      data: [{
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event_id || ('evt-' + Date.now()),
        action_source: 'website',
        user_data: userData,
        custom_data: event_data,
      }],
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return Response.json({ ok: true, fb: json });
  } catch (error) {
    return Response.json({ ok: true, skipped: 'error', error: error.message });
  }
}