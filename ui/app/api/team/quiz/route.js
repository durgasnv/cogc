import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getTeamFromRequest } from '@/lib/auth';
import { getSetById, getBalancedRandomSet } from '@/lib/round2Data';

export async function GET(req) {
  const session = getTeamFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const phase = Number(searchParams.get('phase'));
  if (![1, 2, 3].includes(phase)) {
    return NextResponse.json({ error: 'Invalid or missing phase.' }, { status: 400 });
  }

  const store = kv();
  const assignment = await store.get(`phase:${phase}:assignment:${session.id}`);

  // If already scored
  const existingScore = await store.get(`phase:${phase}:score:${session.id}`);
  if (existingScore) {
    return NextResponse.json({
      error: 'You have already completed this round.',
      alreadyCompleted: true,
      score: existingScore,
    }, { status: 409 });
  }

  // If admin assigned a set, use that or generate a balanced random set for the team
  let set = assignment ? getSetById(assignment.setId) : null;
  if (!set) {
    // Generate a unique balanced set for this team drawing from all categories
    set = getBalancedRandomSet(`${session.id}-phase-${phase}`);
  }

  return NextResponse.json({
    phase,
    setId: set.id,
    group: assignment?.group || 1,
    questions: set.questions,
    standardQuestions: set.standardQuestions || (Array.isArray(set.questions) ? set.questions.filter((q) => !q.bonus) : []),
    bonusQuestions: set.bonusQuestions || (Array.isArray(set.questions) ? set.questions.filter((q) => q.bonus) : []),
  });
}
