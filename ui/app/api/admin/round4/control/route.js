import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { action, word, teamId, delta, category } = body || {};
  const store = kv();

  switch (action) {
    case 'open_buzzer': {
      await store.set('round4:buzzer_open', true);
      await store.set('round4:first_buzz', null);
      await store.set('round4:opened_at', Date.now());
      return NextResponse.json({ ok: true, message: 'Buzzer opened for all teams!' });
    }

    case 'close_buzzer': {
      await store.set('round4:buzzer_open', false);
      return NextResponse.json({ ok: true, message: 'Buzzer locked.' });
    }

    case 'reset_buzzer': {
      await store.set('round4:first_buzz', null);
      await store.set('round4:buzzer_open', false);
      return NextResponse.json({ ok: true, message: 'Buzzer reset.' });
    }

    case 'set_word': {
      if (word) {
        await store.set('round4:active_word', word);
        await store.set('round4:active_category', word.category || 'All');
      }
      await store.set('round4:word_revealed', false);
      await store.set('round4:first_buzz', null);
      await store.set('round4:buzzer_open', false);
      return NextResponse.json({ ok: true, word });
    }

    case 'toggle_reveal': {
      const current = !!(await store.get('round4:word_revealed'));
      await store.set('round4:word_revealed', !current);
      return NextResponse.json({ ok: true, revealed: !current });
    }

    case 'award_points': {
      if (!teamId || typeof delta !== 'number') {
        return NextResponse.json({ error: 'Missing teamId or delta.' }, { status: 400 });
      }
      const scores = (await store.get('round4:scores')) || {};
      const currentScore = scores[teamId] || 0;
      const nextScore = Math.max(0, currentScore + delta);
      scores[teamId] = nextScore;
      await store.set('round4:scores', scores);
      return NextResponse.json({ ok: true, scores, teamId, score: nextScore });
    }

    case 'reset_scores': {
      await store.set('round4:scores', {});
      await store.set('round4:first_buzz', null);
      await store.set('round4:buzzer_open', false);
      await store.set('round4:word_revealed', false);
      return NextResponse.json({ ok: true, message: 'Round 4 scores and buzzer reset.' });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
