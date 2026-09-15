import { NextResponse } from 'next/server';
import { checkAdminPassword, signSession, ADMIN_COOKIE } from '@/lib/auth';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { password } = body || {};
  if (!password) {
    return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
  }

  let ok;
  try {
    ok = checkAdminPassword(password);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  if (!ok) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = signSession({ role: 'admin', ts: Date.now() });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
