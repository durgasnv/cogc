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

  const { score, correct, wrong, attempted, timeTakenSeconds } = body || {};
  if (typeof score !== 'number' || typeof correct !== 'number') {
    return NextResponse.json({ error: 'Malformed score payload.' }, { status: 400 });
  }

  const store = kv();
  const record = {
    teamId: session.id,
    teamName: session.name || session.id,
    score,
    correct,
    wrong: wrong ?? (20 - correct),
    attempted: attempted ?? 20,
    timeTakenSeconds: timeTakenSeconds ?? 240,
    completedAt: Date.now(),
  };

  await store.set(`round5:score:${session.id}`, record);
  await store.sadd('round5:participants', session.id);

  return NextResponse.json({ ok: true, record });
}

export async function GET(req) {
  const session = getTeamFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const store = kv();
  const record = await store.get(`round5:score:${session.id}`);
  return NextResponse.json({ score: record || null });
}
