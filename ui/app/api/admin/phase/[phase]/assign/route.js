import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';
import { getSetsForPhase } from '@/lib/round2Data';
import { PHASE_META } from '@/lib/scoring';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Randomly splits the given team roster into groups of the phase's group size,
 * then assigns each group one of that phase's 10 unique sets — directly, with
 * no team choice, so groups can't pick a set they've seen or coordinate.
 */
export async function POST(req, { params }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const phase = Number(params.phase);
  const meta = PHASE_META[phase];
  if (!meta) return NextResponse.json({ error: 'Invalid phase.' }, { status: 400 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const teamIds = Array.isArray(body?.teamIds) ? [...new Set(body.teamIds)] : [];
  if (teamIds.length === 0) {
    return NextResponse.json({ error: 'Provide at least one team id.' }, { status: 400 });
  }
  if (teamIds.length > meta.groupSize * meta.numGroups) {
    return NextResponse.json({
      error: `Too many teams for Phase ${phase}: max is ${meta.groupSize * meta.numGroups} (${meta.numGroups} groups of ${meta.groupSize}).`,
    }, { status: 400 });
  }

  const sets = getSetsForPhase(phase); // 10 sets available for this phase
  const shuffledTeams = shuffle(teamIds);
  const shuffledSets = shuffle(sets);

  const groups = [];
  let setCursor = 0;
  for (let i = 0; i < shuffledTeams.length; i += meta.groupSize) {
    const groupTeamIds = shuffledTeams.slice(i, i + meta.groupSize);
    const chosenSet = shuffledSets[setCursor % shuffledSets.length];
    setCursor += 1;
    groups.push({
      groupNumber: groups.length + 1,
      setId: chosenSet.id,
      teamIds: groupTeamIds,
    });
  }

  const store = kv();

  // Clear any previous assignment/participants for this phase before writing new ones
  const prevParticipants = await store.smembers(`phase:${phase}:participants`);
  for (const id of prevParticipants || []) {
    await store.del(`phase:${phase}:assignment:${id}`);
    await store.del(`phase:${phase}:score:${id}`);
  }
  if (prevParticipants?.length) await store.srem(`phase:${phase}:participants`, ...prevParticipants);

  for (const group of groups) {
    for (const teamId of group.teamIds) {
      await store.set(`phase:${phase}:assignment:${teamId}`, {
        setId: group.setId,
        group: group.groupNumber,
        teamsInGroup: group.teamIds.length,
      });
      await store.sadd(`phase:${phase}:participants`, teamId);
    }
  }
  await store.set(`phase:${phase}:groups`, groups);

  return NextResponse.json({ phase, groups });
}

export async function GET(req, { params }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const phase = Number(params.phase);
  const store = kv();
  const groups = (await store.get(`phase:${phase}:groups`)) || [];
  return NextResponse.json({ phase, groups });
}
