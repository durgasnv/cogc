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

  const phase = Number(body?.phase);
  if (![1, 2, 3].includes(phase)) {
    return NextResponse.json({ error: 'Invalid phase.' }, { status: 400 });
  }

  const { score, correct, wrong, attempted, catCounts } = body || {};
  if (
    typeof score !== 'number' || typeof correct !== 'number' ||
    typeof wrong !== 'number' || typeof attempted !== 'number'
  ) {
    return NextResponse.json({ error: 'Malformed score payload.' }, { status: 400 });
  }

  const store = kv();

  const assignment = await store.get(`phase:${phase}:assignment:${session.id}`);
  if (!assignment) {
    return NextResponse.json({ error: 'You are not assigned to this phase.' }, { status: 409 });
  }

  const existing = await store.get(`phase:${phase}:score:${session.id}`);
  if (existing) {
    return NextResponse.json({ error: 'Score already submitted for this round.' }, { status: 409 });
  }

  const record = {
    score,
    correct,
    wrong,
    attempted,
    catCounts: catCounts || {},
    setId: assignment.setId,
    group: assignment.group,
    timeTakenSeconds: body.timeTakenSeconds || 0,
    completedAt: Date.now(),
  };
  await store.set(`phase:${phase}:score:${session.id}`, record);

  return NextResponse.json({ ok: true, record });
}
