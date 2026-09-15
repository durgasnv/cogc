import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { signSession, TEAM_COOKIE, checkParticipantPassword, slugifyTeamId } from '@/lib/auth';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = String(body?.name || '').trim();
  const pin = String(body?.pin || '').trim();
  if (!name || !pin) {
    return NextResponse.json({ error: 'Team name and participant password are required.' }, { status: 400 });
  }

  const store = kv();
  const lookupKey = name.toLowerCase();
  const existingId = await store.get(`teamname:${lookupKey}`);
  let team = existingId ? await store.get(`team:${existingId}`) : null;

  // Validate participant password (supports universal password or individual PIN)
  const isPasswordValid = checkParticipantPassword(pin, team?.pin);
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: 'Incorrect participant password. Please enter the event password.' },
      { status: 401 }
    );
  }

  // If team does not exist yet, auto-register on the fly
  if (!team) {
    let id = slugifyTeamId(name);
    let suffix = 1;
    let candidate = id;
    while (await store.get(`team:${candidate}`)) {
      suffix += 1;
      candidate = `${id}-${suffix}`;
    }
    id = candidate;
    team = { id, name, pin, createdAt: Date.now() };
    await store.set(`team:${id}`, team);
    await store.sadd('teams:index', id);
    await store.set(`teamname:${lookupKey}`, id);
  }

  const token = signSession({ role: 'team', id: team.id, name: team.name, ts: Date.now() });
  const res = NextResponse.json({ ok: true, team: { id: team.id, name: team.name } });
  res.cookies.set(TEAM_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 6, // 6 hours
  });
  return res;
}
