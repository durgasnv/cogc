'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getRandomCongratsImage, getRandomSorryImage } from '@/lib/memes';
import AntiCheatShield from '@/components/AntiCheatShield';

const ROUND_SECONDS = 900; // 15 minutes
const ADVANCE_DELAY_MS = 450;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pointsForAnswer(isCorrect, isBonus) {
  if (isBonus) {
    return isCorrect ? 150 : -5;
  }
  return isCorrect ? 100 : -25;
}

function fmtClock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function PlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const phase = Number(params.get('phase'));

  const [status, setStatus] = useState('loading'); // loading | error | ready | playing | bonus_decision | submitting | finished
  const [errorMsg, setErrorMsg] = useState('');
  const [setId, setSetId] = useState(null);

  const gameRef = useRef({
    standardPool: [],
    bonusPool: [],
    queue: [],
    qIndex: 0,
    isBonusPhase: false,
    timeLeft: ROUND_SECONDS,
    attempted: 0,
    correct: 0,
    wrong: 0,
    score: 0,
    catCounts: {},
    answered: false,
    timerId: null,
  });

  const [currentQ, setCurrentQ] = useState(null);
  const [timeLeftDisp, setTimeLeftDisp] = useState(ROUND_SECONDS);
  const [scoreDisp, setScoreDisp] = useState(0);
  const [tallyDisp, setTallyDisp] = useState({ correct: 0, wrong: 0 });
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [pointsPill, setPointsPill] = useState(null); // { pts }
  const [attemptedDisp, setAttemptedDisp] = useState(0);
  const [isBonusActive, setIsBonusActive] = useState(false);
  const [bonusQIndex, setBonusQIndex] = useState(0);
  const [finalResult, setFinalResult] = useState(null);
  const [revealState, setRevealState] = useState(null); // { revealed, passed } once known
  const [activeMeme, setActiveMeme] = useState(null);

  useEffect(() => {
    if (![1, 2, 3].includes(phase)) {
      setStatus('error');
      setErrorMsg('Missing or invalid phase.');
      return;
    }
    (async () => {
      const res = await fetch(`/api/team/quiz?phase=${phase}`);
      const data = await res.json();
      if (res.status === 401) { router.push('/participant/login'); return; }
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Could not load your round.');
        return;
      }
      
      const std = data.standardQuestions && data.standardQuestions.length > 0 
        ? data.standardQuestions 
        : (data.questions ? data.questions.filter((q) => !q.bonus).slice(0, 25) : []);
      
      const bns = data.bonusQuestions && data.bonusQuestions.length > 0 
        ? data.bonusQuestions 
        : (data.questions ? data.questions.filter((q) => q.bonus).slice(0, 5) : []);

      gameRef.current.standardPool = std;
      gameRef.current.bonusPool = bns;
      setSetId(data.setId);
      setStatus('ready');
    })();
  }, [phase, router]);

  function renderNextQuestion() {
    const g = gameRef.current;
    g.answered = false;
    setSelectedIdx(null);
    setPointsPill(null);

    // If we finished standard queue and not in bonus phase, trigger bonus decision
    if (!g.isBonusPhase && g.qIndex >= g.queue.length) {
      setStatus('bonus_decision');
      return;
    }

    // If we finished bonus queue, end round
    if (g.isBonusPhase && g.qIndex >= g.queue.length) {
      endRound();
      return;
    }

    const q = g.queue[g.qIndex];
    g.qIndex += 1;
    g.currentQ = q;
    setCurrentQ(q);
    setAttemptedDisp(g.attempted);
    if (g.isBonusPhase) {
      setBonusQIndex((prev) => prev + 1);
    }
  }

  function tick() {
    const g = gameRef.current;
    g.timeLeft -= 1;
    setTimeLeftDisp(Math.max(g.timeLeft, 0));
    if (g.timeLeft <= 0) {
      clearInterval(g.timerId);
      endRound();
    }
  }

  function startRound() {
    const g = gameRef.current;
    g.queue = shuffle(g.standardPool);
    g.qIndex = 0;
    g.isBonusPhase = false;
    g.attempted = 0; g.correct = 0; g.wrong = 0; g.score = 0; g.catCounts = {};
    g.timeLeft = ROUND_SECONDS;
    setScoreDisp(0);
    setTallyDisp({ correct: 0, wrong: 0 });
    setTimeLeftDisp(ROUND_SECONDS);
    setIsBonusActive(false);
    setBonusQIndex(0);
    setStatus('playing');
    g.timerId = setInterval(tick, 1000);
    renderNextQuestion();
  }

  function handleStartBonus() {
    const g = gameRef.current;
    g.isBonusPhase = true;
    g.queue = shuffle(g.bonusPool);
    g.qIndex = 0;
    setIsBonusActive(true);
    setBonusQIndex(0);
    setStatus('playing');
    renderNextQuestion();
  }

  function handleSkipBonusAndSubmit() {
    endRound();
  }

  function selectAnswer(i) {
    const g = gameRef.current;
    if (g.answered || g.timeLeft <= 0) return;
    g.answered = true;
    setSelectedIdx(i);

    const q = g.currentQ;
    const isCorrect = i === q.a;
    const isBonus = Boolean(g.isBonusPhase || q.bonus);
    const pts = pointsForAnswer(isCorrect, isBonus);

    g.attempted += 1;
    g.score += pts;
    if (isCorrect) { g.correct += 1; bumpCat(q.cat, 'correct'); }
    else { g.wrong += 1; bumpCat(q.cat, 'wrong'); }

    setScoreDisp(g.score);
    setTallyDisp({ correct: g.correct, wrong: g.wrong });
    setPointsPill({ pts });

    setTimeout(() => {
      if (gameRef.current.timeLeft <= 0) { endRound(); return; }
      renderNextQuestion();
    }, ADVANCE_DELAY_MS);
  }

  function bumpCat(cat, kind) {
    const g = gameRef.current;
    if (!g.catCounts[cat]) g.catCounts[cat] = { correct: 0, wrong: 0, total: 0 };
    g.catCounts[cat][kind] += 1;
    g.catCounts[cat].total += 1;
  }

  async function endRound() {
    const g = gameRef.current;
    clearInterval(g.timerId);
    setStatus('submitting');

    const timeTakenSeconds = Math.max(ROUND_SECONDS - g.timeLeft, 1);
    const payload = {
      phase, score: g.score, correct: g.correct, wrong: g.wrong,
      attempted: g.attempted, catCounts: g.catCounts, timeTakenSeconds,
    };
    try {
      const res = await fetch('/api/team/quiz/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) setFinalResult(data.record);
      else setFinalResult(payload); // fall back to local tally if submission race-failed
    } catch {
      setFinalResult(payload);
    }
    setStatus('finished');
  }

  useEffect(() => () => clearInterval(gameRef.current.timerId), []);

  useEffect(() => {
    if (status !== 'finished') return;
    let cancelled = false;
    async function poll() {
      const res = await fetch('/api/team/me');
      if (!res.ok) return;
      const data = await res.json();
      const p = data.phases?.[phase];
      if (!p || cancelled) return;
      setRevealState({ revealed: p.revealed, passed: p.passed });
      if (p.revealed && !activeMeme) {
        const teamSeed = data.team?.id || data.team?.name || String(Math.random());
        const assignedMeme = p.passed
          ? getRandomCongratsImage(null, teamSeed)
          : getRandomSorryImage(null, teamSeed);
        setActiveMeme(assignedMeme);
      }
    }
    poll();
    const id = setInterval(poll, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [status, phase, activeMeme]);

  if (status === 'loading') return <div className="center-screen"><div className="spinner" /></div>;
  if (status === 'error') return (
    <div className="center-screen">
      <div className="card" style={{ maxWidth: 420 }}>
        <p className="error-text">{errorMsg}</p>
        <button className="btn btn-ghost mt-16" onClick={() => router.push('/participant/dashboard')}>Back to dashboard</button>
      </div>
    </div>
  );

  if (status === 'ready') {
    return (
      <div className="center-screen">
        <div className="card card-lg text-center" style={{ maxWidth: 500, border: '1px solid rgba(229, 9, 20, 0.4)' }}>
          <p className="eyebrow mb-8" style={{ color: 'var(--red)' }}>Round 2 &middot; Tech Elimination</p>
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>15 Minutes &middot; 25 Standard Questions</h1>
          <p className="muted mb-24" style={{ fontSize: 14, lineHeight: 1.6 }}>
            Answer 25 balanced questions across <strong>Python, C, Java, Logic & General Tech</strong>.
            <br />
            <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>+100 pts</span> for correct answers,{' '}
            <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>&minus;25 pts</span> for wrong answers.
            <br />
            After 25 questions, you will unlock the choice to play the <strong>Bonus Fire Round (+150 / &minus;5)</strong> or safely lock in your score!
          </p>
          <button className="btn btn-primary btn-block" style={{ height: 48, fontSize: 16 }} onClick={startRound}>Start Round</button>
        </div>
      </div>
    );
  }

  if (status === 'bonus_decision') {
    return (
      <div className="center-screen">
        <div className="card card-lg text-center" style={{ maxWidth: 540, border: '2px solid var(--gold)', boxShadow: '0 0 35px rgba(255, 187, 0, 0.25)' }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,187,0,0.15)', border: '1px solid var(--gold)', borderRadius: 20, color: 'var(--gold)', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            ⚡ STRATEGIC BONUS DECISION
          </div>
          <h2 style={{ fontSize: 28, marginBottom: 8, color: '#fff' }}>25 Questions Completed!</h2>
          <p className="muted mb-20" style={{ fontSize: 15 }}>
            Current Locked Score: <strong style={{ color: 'var(--gold)', fontSize: 20 }}>{gameRef.current.score} pts</strong>
            <br />
            <span className="mono" style={{ fontSize: 13, opacity: 0.8 }}>({gameRef.current.correct} Correct &middot; {gameRef.current.wrong} Wrong &middot; {fmtClock(timeLeftDisp)} remaining)</span>
          </p>

          <div style={{ background: '#181818', borderRadius: 10, padding: 18, marginBottom: 20, textAlign: 'left', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: '#fff' }}>Choose how you wish to proceed:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255, 187, 0, 0.08)', border: '1px solid rgba(255, 187, 0, 0.3)' }}>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--gold)', fontSize: 14 }}>🚀 Option A: Play Bonus Fire Round (5 Dry-Run Questions)</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                  Solve 5 challenging code dry-run questions. Earn <strong style={{ color: 'var(--green)' }}>+150 pts</strong> per correct answer, with only a small <strong style={{ color: 'var(--red)' }}>-5 pts</strong> penalty for wrong answers.
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 14 }}>🔒 Option B: Submit Current Result & Lock Score</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                  Safely finalize your current score right now without any risk of deduction and submit to the leaderboard.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-block"
              style={{
                background: 'linear-gradient(135deg, #FFB800 0%, #E50914 100%)',
                color: '#000',
                fontWeight: 'bold',
                height: 48,
                fontSize: 15,
                flex: 1,
              }}
              onClick={handleStartBonus}
            >
              🔥 Play Bonus Round
            </button>
            <button
              className="btn btn-ghost btn-block"
              style={{
                height: 48,
                fontSize: 14,
                flex: 1,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              onClick={handleSkipBonusAndSubmit}
            >
              ✅ Submit & Lock Score
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'submitting') {
    return <div className="center-screen"><div className="spinner" /></div>;
  }

  if (status === 'finished') {
    const r = finalResult;
    const cats = gameRef.current.catCounts;
    const currentMeme = activeMeme || (revealState?.passed ? getRandomCongratsImage() : getRandomSorryImage());

    function shuffleMeme() {
      const nextMeme = revealState?.passed ? getRandomCongratsImage(currentMeme) : getRandomSorryImage(currentMeme);
      setActiveMeme(nextMeme);
    }

    return (
      <div className="page">
        <div className="container quiz-wrap text-center">
          <p className="eyebrow">Round 2 Complete</p>
          <p className="result-score">{r.score}</p>
          <p className="muted mono">Round 2 &middot; Set {setId}</p>

          {revealState?.revealed ? (
            revealState.passed ? (
              <div>
                <div className="status-banner win" style={{ fontSize: '17px', padding: '16px', fontWeight: 'bold' }}>
                  🔥 W RIZZ! YOU COOKED! Move front and to the next round! 🚀👑
                </div>
                <div style={{ margin: '20px auto', maxWidth: 360, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--green)', boxShadow: '0 0 25px rgba(70,211,105,0.3)' }}>
                  <img
                    src={currentMeme}
                    alt="Congrats Meme"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
                <button className="btn btn-ghost btn-sm mb-16" onClick={shuffleMeme}>
                  🎲 Shuffle Congrats Meme
                </button>
              </div>
            ) : (
              <div>
                <div className="status-banner fail" style={{ fontSize: '17px', padding: '16px', fontWeight: 'bold' }}>
                  🍫 Thanks for participating bestie! Take a chocolate and move to the back 🚶‍♂️💀
                </div>
                <div style={{ margin: '20px auto', maxWidth: 360, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--red)', boxShadow: '0 0 25px rgba(229,9,20,0.3)' }}>
                  <img
                    src={currentMeme}
                    alt="Sorry Meme"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
                <button className="btn btn-ghost btn-sm mb-16" onClick={shuffleMeme}>
                  🎲 Shuffle Sorry Meme
                </button>
              </div>
            )
          ) : (
            <div className="status-banner idle">
              Submitted — waiting for controller to reveal round results. This page updates live.
            </div>
          )}

          <div className="stat-grid">
            <div className="stat"><div className="n win">{r.correct}</div><div className="lbl">Correct</div></div>
            <div className="stat"><div className="n lose">{r.wrong}</div><div className="lbl">Wrong</div></div>
            <div className="stat"><div className="n">{r.attempted}</div><div className="lbl">Attempted</div></div>
          </div>

          {Object.keys(cats).length > 0 && (
            <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
              <p className="eyebrow mb-16">Category breakdown</p>
              {Object.keys(cats).map((cat) => {
                const c = cats[cat];
                return (
                  <div key={cat} className="row-between small mb-8">
                    <span className="mono muted">{cat.toUpperCase()}</span>
                    <span className="mono">{c.correct}/{c.total}</span>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            href="/participant/dashboard"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // playing
  const timerPct = Math.max((timeLeftDisp / ROUND_SECONDS) * 100, 0);
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="page">
      <AntiCheatShield enabled={status === 'playing' || status === 'bonus_decision'} roundName="Round 2" />
      <div className="container quiz-wrap">
        <div className="timer-row">
          <div className="timer-label">
            <span>Time remaining</span>
            <span className={`timer-clock${timeLeftDisp <= 60 ? ' low' : ''}`}>{fmtClock(timeLeftDisp)}</span>
          </div>
          <div className="timer-track"><div className="timer-fill" style={{ width: `${timerPct}%` }} /></div>
        </div>

        {currentQ && (
          <div className="q-card" style={isBonusActive ? { border: '2px solid var(--gold)', boxShadow: '0 0 20px rgba(255,187,0,0.2)' } : {}}>
            <div className="q-meta">
              <span className="q-progress">
                {isBonusActive ? `🔥 Bonus Question ${bonusQIndex} of 5` : `Question ${attemptedDisp + 1} of 25`}
              </span>
              <span
                className="chip"
                style={
                  isBonusActive || currentQ.bonus
                    ? { color: 'var(--gold)', borderColor: 'var(--gold)', background: 'rgba(255,187,0,0.15)', fontWeight: 'bold' }
                    : undefined
                }
              >
                {isBonusActive || currentQ.bonus ? '🔥 BONUS (+150 / -5)' : currentQ.cat.toUpperCase()}
              </span>
            </div>
            <p className="q-text" style={{ whiteSpace: 'pre-line', fontFamily: currentQ.q.includes('\n') ? 'var(--mono)' : 'inherit', fontSize: currentQ.q.includes('\n') ? 14 : 16 }}>
              {currentQ.q}
            </p>
            <div className="q-options">
              {currentQ.o.map((optText, i) => {
                let cls = 'opt';
                if (selectedIdx !== null) {
                  if (i === currentQ.a) cls += ' correct';
                  else if (i === selectedIdx) cls += ' wrong';
                }
                if (i === selectedIdx) cls += ' selected';
                return (
                  <button
                    key={i}
                    className={cls}
                    disabled={selectedIdx !== null}
                    onClick={() => selectAnswer(i)}
                  >
                    <span className="opt-letter">{letters[i]}</span> {optText}
                  </button>
                );
              })}
            </div>
            <div className="q-footer">
              <span className="live-score">Score <strong>{scoreDisp}</strong> &nbsp;&middot;&nbsp; {tallyDisp.correct} correct / {tallyDisp.wrong} wrong</span>
              {pointsPill && (
                <span className={`points-pill show${pointsPill.pts < 0 ? ' neg' : ''}`}>
                  {pointsPill.pts >= 0 ? '+' : ''}{pointsPill.pts} PTS
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="center-screen"><div className="spinner" /></div>}>
      <PlayInner />
    </Suspense>
  );
}
