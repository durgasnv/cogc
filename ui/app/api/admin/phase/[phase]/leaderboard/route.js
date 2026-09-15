import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';

export async function GET(req, { params }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const phase = Number(params.phase);

  const store = kv();
  const teamIds = (await store.smembers(`phase:${phase}:participants`)) || [];
  const groups = (await store.get(`phase:${phase}:groups`)) || [];
  const threshold = await store.get(`phase:${phase}:threshold`);
  const revealed = !!(await store.get(`phase:${phase}:revealed`));

  const rows = [];
  for (const id of teamIds) {
    const team = await store.get(`team:${id}`);
    const assignment = await store.get(`phase:${phase}:assignment:${id}`);
    const score = await store.get(`phase:${phase}:score:${id}`);
    const passed = score && typeof threshold === 'number' ? score.score >= threshold : null;

    rows.push({
      teamId: id,
      teamName: team?.name || id,
      pin: team?.pin || '----',
      group: assignment?.group ?? null,
      setId: assignment?.setId ?? null,
      score: score?.score ?? null,
      correct: score?.correct ?? null,
      wrong: score?.wrong ?? null,
      attempted: score?.attempted ?? null,
      timeTakenSeconds: score?.timeTakenSeconds ?? null,
      completedAt: score?.completedAt ?? null,
      passed,
    });
  }

  // Sort function: 1. Score DESC, 2. Time Taken ASC (Tie breaker), 3. Correct DESC
  const scoreComparator = (a, b) => {
    if (a.score === null && b.score === null) return a.teamName.localeCompare(b.teamName);
    if (a.score === null) return 1;
    if (b.score === null) return -1;

    // Primary: Score
    if (b.score !== a.score) return b.score - a.score;

    // Tie breaker: Time Taken (lower time wins)
    const timeA = a.timeTakenSeconds ?? Infinity;
    const timeB = b.timeTakenSeconds ?? Infinity;
    if (timeA !== timeB) return timeA - timeB;

    // Tertiary: Correct answers
    return (b.correct ?? 0) - (a.correct ?? 0);
  };

  // Group rows by assigned group number
  const byGroup = {};
  for (const row of rows) {
    const g = row.group ?? 'unassigned';
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(row);
  }
  for (const g of Object.keys(byGroup)) {
    byGroup[g].sort(scoreComparator);
  }

  // Global ranked rows across all groups
  const rankedRows = [...rows].sort(scoreComparator);
  let rk = 1;
  rankedRows.forEach((r) => {
    r.globalRank = r.score !== null ? rk++ : '-';
  });

  const submitted = rows.filter((r) => r.score !== null);
  const stats = {
    assigned: rows.length,
    submitted: submitted.length,
    passed: typeof threshold === 'number' ? submitted.filter((r) => r.passed).length : null,
    failed: typeof threshold === 'number' ? submitted.filter((r) => r.passed === false).length : null,
    averageScore: submitted.length
      ? Math.round(submitted.reduce((sum, r) => sum + r.score, 0) / submitted.length)
      : null,
  };

  return NextResponse.json({ phase, groups, byGroup, rankedRows, threshold: threshold ?? null, revealed, stats });
}
