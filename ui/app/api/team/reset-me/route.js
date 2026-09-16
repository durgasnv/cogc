import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getTeamFromRequest } from '@/lib/auth';

export async function POST(req) {
  const session = getTeamFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const store = kv();
  const teamId = session.id;

  // Clear phase 1, 2, 3 scores & assignments for this team
  for (const phase of [1, 2, 3]) {
    await store.del(`phase:${phase}:score:${teamId}`);
    await store.del(`phase:${phase}:assignment:${teamId}`);
  }

  // Clear Round 3 & Round 5 scores
  await store.del(`round3:score:${teamId}`);
  await store.del(`round3:attempt:${teamId}`);
  await store.del(`round5:score:${teamId}`);

  return NextResponse.json({
    ok: true,
    message: `Test data for team '${session.name}' has been reset successfully. You can now re-test all phases.`,
  });
}
