import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getTeamFromRequest } from '@/lib/auth';
import { getRound3SlotFull, toParticipantSafe } from '@/lib/round3Data';

export async function GET(req) {
  const session = getTeamFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const store = kv();
  const active = !!(await store.get('round3:active'));
  if (!active) {
    return NextResponse.json({ error: 'Round 3 has not started yet.' }, { status: 409 });
  }

  const assignment = await store.get(`round3:assignment:${session.id}`);
  if (!assignment) {
    return NextResponse.json({ error: 'Your team did not qualify for Round 3.' }, { status: 403 });
  }

  const slot = getRound3SlotFull(assignment.teamSlot);
  const winner = await store.get('round3:winner');

  return NextResponse.json({
    problems: toParticipantSafe(slot).problems,
    winner: winner || null,
  });
}
