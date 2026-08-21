import { NextResponse } from 'next/server';

function safeDecode(value = '') {
  try { return decodeURIComponent(value); } catch { return value; }
}

function canonicalSize(value = '') {
  const decoded = safeDecode(value).trim();
  const match = decoded.match(/^(\d{2,3})(?:x|х|×)(\d{2,3})$/i);
  return match ? `${match[1]}x${match[2]}` : '';
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const match = pathname.match(/^\/catalog\/beds\/([^/]+)\/?$/i);
  if (!match) return NextResponse.next();

  const canonical = canonicalSize(match[1]);
  if (!canonical) return NextResponse.next();

  const currentDecoded = safeDecode(match[1]);
  if (currentDecoded !== canonical || pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = `/catalog/beds/${canonical}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/catalog/beds/:path*'],
};
