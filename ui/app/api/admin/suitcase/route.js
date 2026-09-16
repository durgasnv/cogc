import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';

export async function GET(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const store = kv();
  const currentCode = (await store.get('round5:suitcase:code')) || process.env.ROUND5_SUITCASE_CODE || '000000000';
  const unlocks = (await store.smembers('round5:unlocks')) || [];

  return NextResponse.json({
    code: currentCode,
    unlockCount: unlocks.length,
    unlockedTeams: unlocks,
  });
}

export async function POST(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const code = String(body?.code || '').trim().replace(/\D/g, '');
  if (code.length !== 9) {
    return NextResponse.json({ error: 'Suitcase code must be exactly 9 digits.' }, { status: 400 });
  }

  const store = kv();
  await store.set('round5:suitcase:code', code);

  return NextResponse.json({
    ok: true,
    code,
    message: `Suitcase combination updated to: ${code}`,
  });
}
