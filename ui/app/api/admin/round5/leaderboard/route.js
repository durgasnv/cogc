import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';

export async function GET(req) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const store = kv();
  const teamIds = (await store.smembers('teams')) || [];
  const threshold = (await store.get('round5:threshold')) ?? 1200; // default 12/20 = 1200 pts
  const revealed = !!(await store.get('round5:revealed'));

  const rows = [];
  for (const id of teamIds) {
    const team = await store.get(`team:${id}`);
    const score = await store.get(`round5:score:${id}`);
    const passed = score ? score.score >= threshold : null;

    rows.push({
      teamId: id,
      teamName: team?.name || id,
      pin: team?.pin || '----',
      score: score?.score ?? null,
      correct: score?.correct ?? null,
      wrong: score?.wrong ?? null,
      attempted: score?.attempted ?? null,
      timeTakenSeconds: score?.timeTakenSeconds ?? null,
      completedAt: score?.completedAt ?? null,
      passed,
    });
  }

  // Sort rows with strict tie-breaking rule:
  // 1. Submitted scores first
  // 2. Score DESC (higher score wins)
  // 3. Time Taken ASC (faster/lower time wins when scores clash!)
  // 4. Correct count DESC
  rows.sort((a, b) => {
    if (a.score === null && b.score === null) return a.teamName.localeCompare(b.teamName);
    if (a.score === null) return 1;
    if (b.score === null) return -1;

    // Score comparison
    if (b.score !== a.score) return b.score - a.score;

    // Tie-breaker: Time taken (lower time wins!)
    const timeA = a.timeTakenSeconds ?? Infinity;
    const timeB = b.timeTakenSeconds ?? Infinity;
    if (timeA !== timeB) return timeA - timeB;

    // Tertiary: More correct answers
    const corA = a.correct ?? 0;
    const corB = b.correct ?? 0;
    return corB - corA;
  });

  // Assign calculated rank based on tie-broken sort order
  let currentRank = 1;
  rows.forEach((r) => {
    if (r.score !== null) {
      r.rank = currentRank++;
    } else {
      r.rank = '-';
    }
  });

  const submitted = rows.filter((r) => r.score !== null);
  const stats = {
    totalTeams: rows.length,
    submitted: submitted.length,
    passed: submitted.filter((r) => r.passed).length,
    failed: submitted.filter((r) => r.passed === false).length,
    averageScore: submitted.length
      ? Math.round(submitted.reduce((sum, r) => sum + r.score, 0) / submitted.length)
      : null,
    fastestTime: submitted.length
      ? Math.min(...submitted.map((r) => r.timeTakenSeconds ?? Infinity))
      : null,
  };

  return NextResponse.json({ rows, threshold, revealed, stats });
}

export async function POST(req) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const store = kv();
  if (typeof body.threshold === 'number') {
    await store.set('round5:threshold', body.threshold);
  }
  if (typeof body.revealed === 'boolean') {
    await store.set('round5:revealed', body.revealed);
  }
  if (body.reset) {
    const teamIds = (await store.smembers('teams')) || [];
    for (const id of teamIds) {
      await store.del(`round5:score:${id}`);
    }
    await store.del('round5:participants');
  }

  return NextResponse.json({ ok: true });
}
