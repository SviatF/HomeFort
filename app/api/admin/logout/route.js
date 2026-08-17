import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, callAdminRpc } from '@/lib/domeraAdminDb';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    try {
      await callAdminRpc('admin_logout', { p_token: token });
    } catch {}
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
