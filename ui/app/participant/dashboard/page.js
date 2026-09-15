'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParticipantDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/team/me');
    if (res.status === 401) {
      router.push('/participant/login');
      return;
    }
    const json = await res.json();
    if (res.ok) {
      setData(json);
      setError('');
    } else {
      setError(json.error || 'Failed to load status.');
    }
  }, [router]);

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  if (error) {
    return (
      <div className="center-screen">
        <p className="error-text">{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  const { team, phases, round3, round5, isEliminated, eliminatedInRound } = data;
  const p2 = phases?.[2] || {};
  const r3 = round3 || {};

  // Check specific elimination thresholds
  const eliminatedInR2 = p2.revealed && p2.passed === false;
  const eliminatedInR3 = r3.score && r3.passed === false;
  const cannotPlayR3 = eliminatedInR2;
  const cannotPlayR5 = eliminatedInR2 || eliminatedInR3;

  return (
    <div className="page">
      <nav className="topnav">
        <span className="brand">COOK <span>OR GET COOKED</span></span>
        <div className="nav-actions">
          <span className="chip" style={{ color: 'var(--white)', borderColor: isEliminated ? 'var(--red)' : 'var(--green)' }}>
            Team: {team.name} {isEliminated ? '💀' : '🔥'}
          </span>
        </div>
      </nav>

      <div className="container mt-32" style={{ paddingBottom: 60 }}>
        <div className="row-between mb-8">
          <h1 style={{ fontSize: 40 }}>Participant Arena</h1>
          {isEliminated && (
            <span className="chip red" style={{ fontWeight: 'bold' }}>
              Eliminated in Round {eliminatedInRound}
            </span>
          )}
        </div>
        <p className="muted mb-24">Tournament Rounds · Dashboard updates live as results are revealed.</p>

        {/* Global Elimination Notice Banner */}
        {isEliminated && (
          <div className="status-banner fail mb-24" style={{ fontSize: 16, fontWeight: 'bold', padding: 18 }}>
            🍫 Thanks for participating bestie! Take a chocolate and move to the back 🚶‍♂️💀
            <div style={{ fontSize: 13, fontWeight: 'normal', marginTop: 6, color: 'var(--muted)' }}>
              Your tournament run concluded in Round {eliminatedInRound}. Access to subsequent rounds has been locked.
            </div>
          </div>
        )}

        {/* --- ROUND 2: TECH FIRE ROUND --- */}
        <div className="card mb-20" style={{ opacity: eliminatedInR2 ? 0.85 : 1 }}>
          <div className="row-between mb-8">
            <div>
              <span className="eyebrow" style={{ color: 'var(--red)' }}>Round 2</span>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>Tech MCQ Fire Round</h3>
            </div>
            {p2.score ? (
              p2.revealed ? (
                p2.passed ? <span className="chip green">Qualified 🔥</span> : <span className="chip red">Eliminated 💀</span>
              ) : (
                <span className="chip">Awaiting Host Results</span>
              )
            ) : p2.assignment ? (
              <span className="chip gold">Ready to Play</span>
            ) : (
              <span className="chip">Waiting for Host</span>
            )}
          </div>

          {p2.score ? (
            <div>
              <div className="row mb-8" style={{ gap: 24 }}>
                <div><span className="mono" style={{ fontSize: 24, color: 'var(--red)' }}>{p2.score.score}</span> <span className="muted small">pts</span></div>
                <div className="muted small">{p2.score.correct} correct / {p2.score.wrong} wrong &middot; {p2.score.timeTakenSeconds || 0}s</div>
              </div>
              {p2.revealed ? (
                p2.passed ? (
                  <div className="status-banner win" style={{ marginTop: 0, fontWeight: 'bold' }}>
                    🔥 W RIZZ! YOU COOKED! Move front and to the next round! 🚀👑
                  </div>
                ) : (
                  <div className="status-banner fail" style={{ marginTop: 0, fontWeight: 'bold' }}>
                    🍫 Thanks for participating bestie! Take a chocolate and move to the back 🚶‍♂️💀
                  </div>
                )
              ) : (
                <div className="status-banner idle" style={{ marginTop: 0 }}>
                  Submitted — waiting for host to announce round rankings.
                </div>
              )}
            </div>
          ) : (
            <div className="row-between">
              <p className="muted small">35 Tech MCQs across C, Python, Java, Logic &amp; Bonus. (12m Timer).</p>
              <Link href="/participant/play?phase=2" className="btn btn-primary btn-sm">
                Start Round 2
              </Link>
            </div>
          )}
        </div>

        {/* --- ROUND 3: HUMAN VS AI TURING TEST --- */}
        <div className="card mb-20" style={{ opacity: cannotPlayR3 ? 0.65 : 1 }}>
          <div className="row-between mb-8">
            <div>
              <span className="eyebrow" style={{ color: 'var(--gold)' }}>Round 3</span>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>Human vs AI Turing Test</h3>
            </div>
            {r3.score ? (
              r3.passed ? (
                <span className="chip green">Passed ({r3.score.score} pts) 🔥</span>
              ) : (
                <span className="chip red">Eliminated ({r3.score.score} pts) 💀</span>
              )
            ) : cannotPlayR3 ? (
              <span className="chip red">Locked</span>
            ) : (
              <span className="chip gold">20 Challenges · 5 Mins</span>
            )}
          </div>

          {cannotPlayR3 ? (
            <div className="row-between">
              <p className="muted small" style={{ color: 'var(--red-light)' }}>
                🔒 Locked: Your team did not advance past Round 2.
              </p>
              <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                Access Disabled
              </button>
            </div>
          ) : r3.score ? (
            <div>
              <div className="row mb-8" style={{ gap: 24 }}>
                <div><span className="mono" style={{ fontSize: 24, color: r3.passed ? 'var(--green)' : 'var(--red)' }}>{r3.score.score}</span> <span className="muted small">pts</span></div>
                <div className="muted small">{r3.score.correct}/20 correct &middot; Time: {r3.score.timeTakenSeconds}s</div>
              </div>
              <div className="row-between">
                {r3.passed ? (
                  <p className="small" style={{ color: 'var(--green)' }}>Qualified for Round 4 Stage Charades!</p>
                ) : (
                  <p className="small" style={{ color: 'var(--red)' }}>Eliminated in Round 3.</p>
                )}
                <Link href="/participant/round3" className="btn btn-ghost btn-sm">
                  Review Turing Challenges
                </Link>
              </div>
            </div>
          ) : (
            <div className="row-between">
              <p className="muted small">Spot Human vs AI code in 20 rapid challenges under 5 minutes.</p>
              <Link href="/participant/round3" className="btn btn-primary btn-sm">
                Enter Round 3 (5m)
              </Link>
            </div>
          )}
        </div>

        {/* --- ROUND 5: GRAND FINALE --- */}
        <div className="card mb-20" style={{ opacity: cannotPlayR5 ? 0.65 : 1 }}>
          <div className="row-between mb-8">
            <div>
              <span className="eyebrow" style={{ color: 'var(--red)' }}>Round 5</span>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>Grand Finale Championship</h3>
            </div>
            {cannotPlayR5 ? (
              <span className="chip red">Locked</span>
            ) : (
              <span className="chip">Upcoming</span>
            )}
          </div>
          <div className="row-between">
            {cannotPlayR5 ? (
              <p className="muted small" style={{ color: 'var(--red-light)' }}>
                🔒 Locked: Only Top 4 advancing finalists can enter Round 5.
              </p>
            ) : (
              <p className="muted small">Final championship round for top advancing finalists.</p>
            )}
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
              {cannotPlayR5 ? 'Access Disabled' : 'Standing By'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
