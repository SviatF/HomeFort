import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, callAdminRpc } from '@/lib/domeraAdminDb';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Вкажіть email і пароль.' }, { status: 400 });
    }

    const result = await callAdminRpc('admin_login', { p_email: email, p_password: password });
    if (!result?.ok || !result?.token) {
      return NextResponse.json({ ok: false, error: 'Невірний логін або пароль.' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true, user: result.user });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || 'Помилка входу.' }, { status: 500 });
  }
}
