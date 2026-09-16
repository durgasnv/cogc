import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest, getTeamFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const store = kv();
  const isAdmin = isAdminRequest(req);
  const team = getTeamFromRequest(req);

  const buzzerOpen = !!(await store.get('round4:buzzer_open'));
  const openedAt = (await store.get('round4:opened_at')) || null;
  const firstBuzz = (await store.get('round4:first_buzz')) || null;
  const activeWord = (await store.get('round4:active_word')) || null;
  const activeCategory = (await store.get('round4:active_category')) || 'All';
  const scores = (await store.get('round4:scores')) || {};
  const wordRevealed = !!(await store.get('round4:word_revealed'));

  // If not admin, mask word details unless host chose to reveal
  const wordPayload = isAdmin || wordRevealed
    ? activeWord
    : activeWord
    ? { category: activeWord.category, revealed: false }
    : null;

  return NextResponse.json({
    buzzerOpen,
    openedAt,
    firstBuzz,
    activeCategory,
    activeWord: wordPayload,
    wordRevealed,
    scores,
    currentTeamId: team?.id || null,
  });
}
