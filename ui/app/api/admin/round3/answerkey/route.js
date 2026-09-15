import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';
import { getAllRound3SlotsFull } from '@/lib/round3Data';

export async function GET(req) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const store = kv();
  const finalists = await store.smembers('round3:finalists');
  const teams = [];
  for (const id of finalists || []) {
    const team = await store.get(`team:${id}`);
    const assignment = await store.get(`round3:assignment:${id}`);
    teams.push({ teamId: id, teamName: team?.name || id, teamSlot: assignment?.teamSlot });
  }

  const winner = await store.get('round3:winner');

  return NextResponse.json({
    teams,
    winner: winner || null,
    slots: getAllRound3SlotsFull(), // full data incl. fixedCode/target/combination — admin only
  });
}
