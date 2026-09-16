import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getTeamFromRequest } from '@/lib/auth';

export async function POST(req) {
  const session = getTeamFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const entered = String(body?.code || '').trim().replace(/\D/g, '');
  if (entered.length !== 9) {
    return NextResponse.json({ valid: false, error: 'Code must be exactly 9 digits.' }, { status: 400 });
  }

  const store = kv();
  const validSetCodes = ['482719365', '474838529', '533614379', '626811399'];
  const adminCode = await store.get('round5:suitcase:code');

  const isMatch = (adminCode && entered === String(adminCode).trim()) || validSetCodes.includes(entered);

  if (isMatch) {
    // Record successful unlock by this finalist team
    await store.set(`round5:unlocked:${session.id}`, {
      teamId: session.id,
      teamName: session.name,
      unlockedAt: Date.now(),
      codeEntered: entered,
    });
    await store.sadd('round5:unlocks', session.id);
  }

  return NextResponse.json({
    valid: isMatch,
    message: isMatch
      ? '🎉 SUITCASE UNLOCKED! Grand Finale combination verified!'
      : '🔒 Incorrect combination. Verify your 3 C code outputs and try again.',
  });
}
