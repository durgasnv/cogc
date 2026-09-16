import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';

export async function POST(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Require explicit confirmation flag
  if (body.confirm !== 'RESET_TOURNAMENT_CONFIRMED') {
    return NextResponse.json({
      error: 'Confirmation string "RESET_TOURNAMENT_CONFIRMED" required.',
    }, { status: 400 });
  }

  const store = kv();

  // Find all score and assignment keys to purge
  const allKeys = await store.keys('*');
  let purgedCount = 0;

  for (const key of allKeys) {
    if (
      key.includes(':score:') ||
      key.includes(':assignment:') ||
      key.includes(':attempt:') ||
      key.includes('round5:unlocked:') ||
      key.includes('round5:unlocks') ||
      key.includes('round3:participants') ||
      key.includes('round5:participants')
    ) {
      await store.del(key);
      purgedCount++;
    }
  }

  return NextResponse.json({
    ok: true,
    message: `Tournament test data purged successfully. ${purgedCount} score records wiped. Teams roster remains intact for live event.`,
    purgedCount,
  });
}
