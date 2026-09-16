import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getTeamFromRequest } from '@/lib/auth';

export async function GET(req) {
  const session = getTeamFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const store = kv();
  const phases = {};
  for (const phase of [1, 2, 3]) {
    const assignment = await store.get(`phase:${phase}:assignment:${session.id}`);
    const score = await store.get(`phase:${phase}:score:${session.id}`);
    const threshold = await store.get(`phase:${phase}:threshold`);
    const revealed = !!(await store.get(`phase:${phase}:revealed`));
    const passed = score && revealed && typeof threshold === 'number' ? score.score >= threshold : null;
    phases[phase] = { assignment: assignment || null, score: score || null, revealed, passed };
  }

  // Round 3 (Human vs AI Turing Test)
  const r3Score = await store.get(`round3:score:${session.id}`);
  const r3Threshold = (await store.get('round3:threshold')) ?? 1200;
  const r3Revealed = !!(await store.get('round3:revealed'));
  const r3Passed = r3Score ? r3Score.score >= r3Threshold : null;

  // Round 5 (Grand Finale)
  const r5Score = await store.get(`round5:score:${session.id}`);
  const r5Threshold = (await store.get('round5:threshold')) ?? 1200;
  const r5Revealed = !!(await store.get('round5:revealed'));
  const r5Passed = r5Score ? r5Score.score >= r5Threshold : null;

  // Determine overall elimination state
  let isEliminated = false;
  let eliminatedInRound = null;

  if (phases[2]?.revealed && phases[2]?.passed === false) {
    isEliminated = true;
    eliminatedInRound = 2;
  } else if ((r3Revealed || r3Score) && r3Passed === false) {
    isEliminated = true;
    eliminatedInRound = 3;
  } else if ((r5Revealed || r5Score) && r5Passed === false) {
    isEliminated = true;
    eliminatedInRound = 5;
  }

  const isTestTeam =
    process.env.NODE_ENV !== 'production' ||
    session.name === 'Dev Tester' ||
    session.id === 'dev-tester' ||
    session.name?.toLowerCase().includes('tester') ||
    session.name?.toLowerCase().includes('test');
  if (isTestTeam) {
    isEliminated = false;
    eliminatedInRound = null;
  }

  return NextResponse.json({
    team: { id: session.id, name: session.name },
    phases,
    round3: {
      score: r3Score || null,
      revealed: r3Revealed,
      passed: r3Passed,
    },
    round5: {
      score: r5Score || null,
      revealed: r5Revealed,
      passed: r5Passed,
    },
    isEliminated,
    eliminatedInRound,
    isTestTeam,
  });
}
