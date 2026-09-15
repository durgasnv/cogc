import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getTeamFromRequest } from '@/lib/auth';
import { getRound3SlotFull } from '@/lib/round3Data';

function normalizeCode(raw) {
  return String(raw || '').replace(/[^0-9]/g, '');
}

export async function POST(req) {
  const session = getTeamFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const guess = normalizeCode(body?.guess);
  if (guess.length !== 9) {
    return NextResponse.json({ error: 'Enter all 9 digits.' }, { status: 400 });
  }

  const store = kv();
  const active = !!(await store.get('round3:active'));
  if (!active) return NextResponse.json({ error: 'Round 3 is not active.' }, { status: 409 });

  const assignment = await store.get(`round3:assignment:${session.id}`);
  if (!assignment) return NextResponse.json({ error: 'Your team did not qualify for Round 3.' }, { status: 403 });

  const slot = getRound3SlotFull(assignment.teamSlot);
  const expected = normalizeCode(slot.combination);
  const correct = guess === expected;

  await store.set(`round3:attempt:${session.id}`, { guess, correct, ts: Date.now() });

  if (correct) {
    // Atomic: only the first correct team gets to set the winner key.
    const wonFirst = await store.set('round3:winner', {
      teamId: session.id,
      teamName: session.name,
      ts: Date.now(),
    }, { nx: true });

    const winner = await store.get('round3:winner');
    return NextResponse.json({
      correct: true,
      isWinner: !!wonFirst,
      winner,
    });
  }

  return NextResponse.json({ correct: false });
}
