import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, callAdminRpc } from '@/lib/domeraAdminDb';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });

    const result = await callAdminRpc('admin_session_user', { p_token: token });
    if (!result?.ok || !result?.user) {
      cookieStore.delete(ADMIN_SESSION_COOKIE);
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user: result.user });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
