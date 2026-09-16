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
          <span className="chip" style={{ color: 'var(--white)', borderColor: isEliminated ? 'var(--red)' : 'var(--green)', fontFamily: 'var(--font-mono)' }}>
            Team: {team.name} {isEliminated ? '💀' : '🔥'}
          </span>
        </div>
      </nav>

      <div className="container mt-32" style={{ paddingBottom: 60 }}>
        <div className="row-between mb-8">
          <div>
            <span className="eyebrow" style={{ color: 'var(--red)' }}>LIVE TOURNAMENT DASHBOARD</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, letterSpacing: '0.03em', marginTop: 4 }}>
              PARTICIPANT <span style={{ color: 'var(--red)' }}>ARENA</span>
            </h1>
          </div>
          {isEliminated && (
            <span className="chip red" style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              Eliminated in Round {eliminatedInRound}
            </span>
          )}
        </div>
        <p className="muted mb-24" style={{ fontSize: 15 }}>
          Follow your tournament progress. Results update automatically when host controller reveals stages.
        </p>

        {/* Global Elimination Notice Banner */}
        {isEliminated && (
          <div className="status-banner fail mb-24" style={{ fontSize: 16, fontWeight: 'bold', padding: 20 }}>
            🍫 Thanks for participating bestie! Take a chocolate and move to the back 🚶‍♂️💀
            <div style={{ fontSize: 13, fontWeight: 'normal', marginTop: 6, color: 'var(--muted)' }}>
              Your tournament run concluded in Round {eliminatedInRound}. Access to subsequent rounds has been locked.
            </div>
          </div>
        )}

        {/* --- ROUND 2: TECH FIRE ROUND --- */}
        <div className="poster-card mb-20" style={{ opacity: eliminatedInR2 ? 0.75 : 1, cursor: 'default' }}>
          <div className="row-between mb-8">
            <div>
              <span className="eyebrow" style={{ color: 'var(--red)' }}>Round 2 &middot; Eliminator</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 4, letterSpacing: '0.02em' }}>
                Tech MCQ Fire Round
              </h3>
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
              <div className="row mb-12" style={{ gap: 24, alignItems: 'baseline' }}>
                <div>
                  <span className="mono" style={{ fontSize: 32, fontWeight: 800, color: 'var(--red)' }}>
                    {p2.score.score}
                  </span>
                  <span className="muted small" style={{ marginLeft: 6 }}>pts</span>
                </div>
                <div className="muted small mono">
                  {p2.score.correct} correct / {p2.score.wrong} wrong &middot; {p2.score.timeTakenSeconds || 0}s
                </div>
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
              <p className="muted small">30 Tech MCQs across C, Python, Java, Logic &amp; 5 Bonus dry-runs (15m Timer).</p>
              <Link href="/participant/play?phase=2" className="btn btn-primary btn-sm">
                Start Round 2 (15m) &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* --- ROUND 3: HUMAN VS AI TURING TEST --- */}
        <div className="poster-card mb-20" style={{ opacity: cannotPlayR3 ? 0.6 : 1, cursor: 'default' }}>
          <div className="row-between mb-8">
            <div>
              <span className="eyebrow" style={{ color: 'var(--gold)' }}>Round 3 &middot; Turing Showdown</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 4, letterSpacing: '0.02em' }}>
                Human vs AI Turing Test
              </h3>
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
              <span className="chip gold">20 Challenges &middot; 15 Mins</span>
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
              <div className="row mb-12" style={{ gap: 24, alignItems: 'baseline' }}>
                <div>
                  <span className="mono" style={{ fontSize: 32, fontWeight: 800, color: r3.passed ? 'var(--green)' : 'var(--red)' }}>
                    {r3.score.score}
                  </span>
                  <span className="muted small" style={{ marginLeft: 6 }}>pts</span>
                </div>
                <div className="muted small mono">{r3.score.correct}/20 correct &middot; Time: {r3.score.timeTakenSeconds}s</div>
              </div>
              <div className="row-between">
                {r3.passed ? (
                  <p className="small" style={{ color: 'var(--green)', fontWeight: 600 }}>Qualified for Round 4 Stage Charades! 🎭</p>
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
              <p className="muted small">Spot Human vs AI code in 20 randomized challenges under 15 minutes.</p>
              <Link href="/participant/round3" className="btn btn-primary btn-sm">
                Enter Round 3 (15m) &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* --- ROUND 4: AUDITORIUM BUZZER CHARADES --- */}
        <Link href="/participant/round4" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div className="poster-card mb-20" style={{ border: '1px solid #00E5FF', boxShadow: '0 0 20px rgba(0,229,255,0.15)', cursor: 'pointer' }}>
            <div className="row-between mb-8">
              <div>
                <span className="eyebrow" style={{ color: '#00E5FF' }}>Round 4 &middot; Live Buzzer Arena</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 4, letterSpacing: '0.02em' }}>
                  Telugu Cinema &amp; Tech Charades 🎭
                </h3>
              </div>
              <span className="chip" style={{ color: '#00E5FF', borderColor: '#00E5FF', background: 'rgba(0,229,255,0.1)' }}>
                🚨 LIVE BUZZER OPEN
              </span>
            </div>
            <div className="row-between">
              <p className="muted small">
                Watch the stage performance and slam your laptop buzzer to guess the movie or tech prompt first!
              </p>
              <span className="btn btn-sm btn-primary" style={{ background: '#00E5FF', color: '#000', fontWeight: 'bold' }}>
                Enter Buzzer Arena &rarr;
              </span>
            </div>
          </div>
        </Link>

        {/* --- ROUND 5: GRAND FINALE --- */}
        <div className="poster-card mb-20" style={{ opacity: cannotPlayR5 ? 0.6 : 1, cursor: 'default', border: !cannotPlayR5 ? '1px solid var(--gold)' : undefined }}>
          <div className="row-between mb-8">
            <div>
              <span className="eyebrow" style={{ color: 'var(--gold)' }}>Round 5 &middot; Championship</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 4, letterSpacing: '0.02em' }}>
                Grand Finale &middot; C Debugging &amp; Suitcase Lock
              </h3>
            </div>
            {cannotPlayR5 ? (
              <span className="chip red">Locked</span>
            ) : (
              <span className="chip gold">Top 4 Finalists &middot; 25 Mins</span>
            )}
          </div>
          <div className="row-between">
            {cannotPlayR5 ? (
              <p className="muted small" style={{ color: 'var(--red-light)' }}>
                🔒 Locked: Only Top advancing finalists can enter Round 5.
              </p>
            ) : (
              <p className="muted small">
                Debug 5 C programs, solve the 3 combination codes, and crack the 9-digit suitcase lock!
              </p>
            )}
            {cannotPlayR5 ? (
              <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                Access Disabled
              </button>
            ) : (
              <Link href="/participant/round5" className="btn btn-primary btn-sm" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
                Enter Finale Chamber (25m) 👑
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
