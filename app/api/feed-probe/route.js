import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://homefort.ua/index.php?route=extension/feed/google_merchant&lang=uk', { cache: 'no-store' });
    const text = await response.text();
    const items = (text.match(/<item>/g) || []).length;
    return NextResponse.json({ ok: response.ok, status: response.status, bytes: text.length, items, startsWith: text.slice(0, 80) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 500 });
  }
}
