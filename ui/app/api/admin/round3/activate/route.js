import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';
import { getAllRound3SlotsFull } from '@/lib/round3Data';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const teamIds = Array.isArray(body?.teamIds) ? [...new Set(body.teamIds)] : [];
  if (teamIds.length !== 10) {
    return NextResponse.json({ error: `Round 3 needs exactly 10 finalist teams (got ${teamIds.length}).` }, { status: 400 });
  }

  const slots = getAllRound3SlotsFull(); // 10 team slots, 1..10
  const shuffledTeams = shuffle(teamIds);
  const shuffledSlots = shuffle(slots.map((s) => s.teamSlot));

  const store = kv();

  // clear previous round 3 state
  const prevFinalists = await store.smembers('round3:finalists');
  for (const id of prevFinalists || []) {
    await store.del(`round3:assignment:${id}`);
  }
  if (prevFinalists?.length) await store.srem('round3:finalists', ...prevFinalists);
  await store.del('round3:winner');

  const assignments = [];
  for (let i = 0; i < shuffledTeams.length; i++) {
    const teamId = shuffledTeams[i];
    const teamSlot = shuffledSlots[i];
    await store.set(`round3:assignment:${teamId}`, { teamSlot });
    await store.sadd('round3:finalists', teamId);
    assignments.push({ teamId, teamSlot });
  }
  await store.set('round3:active', true);

  return NextResponse.json({ assignments });
}

export async function DELETE(req) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const store = kv();
  const finalists = await store.smembers('round3:finalists');
  for (const id of finalists || []) {
    await store.del(`round3:assignment:${id}`);
  }
  if (finalists?.length) await store.srem('round3:finalists', ...finalists);
  await store.del('round3:winner');
  await store.set('round3:active', false);
  return NextResponse.json({ ok: true });
}
