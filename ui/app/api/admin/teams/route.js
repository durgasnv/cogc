import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest, generatePin, slugifyTeamId } from '@/lib/auth';
import initialTeams from '@/lib/data/registered-teams.json';

async function ensureSeedTeams(store) {
  for (const rawName of initialTeams) {
    const name = String(rawName).trim();
    if (!name) continue;
    const lookupKey = name.toLowerCase();
    const exists = await store.get(`teamname:${lookupKey}`);
    if (!exists) {
      let id = slugifyTeamId(name);
      let suffix = 1;
      let candidate = id;
      while (await store.get(`team:${candidate}`)) {
        suffix += 1;
        candidate = `${id}-${suffix}`;
      }
      id = candidate;
      const pin = generatePin();
      const team = { id, name, pin, createdAt: Date.now() };
      await store.set(`team:${id}`, team);
      await store.sadd('teams:index', id);
      await store.set(`teamname:${lookupKey}`, id);
    }
  }
}

export async function GET(req) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const store = kv();
  await ensureSeedTeams(store);
  const ids = await store.smembers('teams:index');
  const loggedInIds = new Set((await store.smembers('teams:logged_in')) || []);

  const teams = [];
  for (const id of ids || []) {
    const t = await store.get(`team:${id}`);
    if (t) {
      const lastActive = await store.get(`team:${id}:last_active`);
      teams.push({
        ...t,
        isLoggedIn: loggedInIds.has(id),
        lastActive: lastActive || null,
      });
    }
  }
  teams.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({
    teams,
    totalCount: teams.length,
    loggedInCount: teams.filter((t) => t.isLoggedIn).length,
  });
}

export async function POST(req) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const names = Array.isArray(body?.names)
    ? body.names
    : (body?.name ? [body.name] : []);

  if (!names.length) {
    return NextResponse.json({ error: 'Provide at least one team name.' }, { status: 400 });
  }

  const store = kv();
  const created = [];
  const skipped = [];
  for (const rawName of names) {
    const name = String(rawName).trim();
    if (!name) continue;

    const lookupKey = name.toLowerCase();
    const alreadyExists = await store.get(`teamname:${lookupKey}`);
    if (alreadyExists) { skipped.push(name); continue; }

    let id = slugifyTeamId(name);
    // ensure the storage key itself is unique even if two different names
    // happen to slugify to the same thing (e.g. both are all-symbols)
    let suffix = 1;
    let candidate = id;
    while (await store.get(`team:${candidate}`)) {
      suffix += 1;
      candidate = `${id}-${suffix}`;
    }
    id = candidate;
    const pin = generatePin();
    const team = { id, name, pin, createdAt: Date.now() };
    await store.set(`team:${id}`, team);
    await store.sadd('teams:index', id);
    // exact-name -> id index, so login never has to re-derive (and potentially
    // collide on) a lossy slug of the name
    await store.set(`teamname:${lookupKey}`, id);
    created.push(team);
  }

  return NextResponse.json({ created, skipped });
}

export async function DELETE(req) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing team id.' }, { status: 400 });

  const store = kv();
  const team = await store.get(`team:${id}`);
  if (team?.name) {
    await store.del(`teamname:${team.name.toLowerCase()}`);
  }
  await store.del(`team:${id}`);
  await store.srem('teams:index', id);
  return NextResponse.json({ ok: true });
}
