import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getTeamFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const session = getTeamFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated as a team.' }, { status: 401 });
  }

  const store = kv();
  const buzzerOpen = await store.get('round4:buzzer_open');
  if (!buzzerOpen) {
    const existing = await store.get('round4:first_buzz');
    return NextResponse.json({
      ok: false,
      first: false,
      message: existing ? `⚡ ${existing.teamName} buzzed first!` : '🔒 Buzzer is locked.',
      firstBuzz: existing,
    });
  }

  const existing = await store.get('round4:first_buzz');
  if (existing) {
    return NextResponse.json({
      ok: false,
      first: false,
      message: `⚡ ${existing.teamName} beat you to the buzzer!`,
      firstBuzz: existing,
    });
  }

  const now = Date.now();
  const openedAt = (await store.get('round4:opened_at')) || now;
  const elapsedMs = Math.max(0, now - openedAt);

  const buzzRecord = {
    teamId: session.id,
    teamName: session.name,
    buzzedAt: now,
    elapsedMs,
    elapsedSeconds: (elapsedMs / 1000).toFixed(2),
  };

  // Lock the buzzer instantly and assign first buzz
  await store.set('round4:first_buzz', buzzRecord);
  await store.set('round4:buzzer_open', false);

  return NextResponse.json({
    ok: true,
    first: true,
    message: '🎉 YOU BUZZED FIRST! Say your guess out loud!',
    firstBuzz: buzzRecord,
  });
}
