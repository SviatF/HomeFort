import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, getAdminFromSession } from '@/lib/localAdminDb';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getAdminFromSession(token);
    if (!user) {
      cookieStore.delete(ADMIN_SESSION_COOKIE);
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
