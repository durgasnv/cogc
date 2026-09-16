'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function fmtTime(secs) {
  if (secs === null || secs === undefined || secs === Infinity) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

export default function ProjectorArenaPage() {
  const [activeRound, setActiveRound] = useState('round2'); // 'round2' | 'round3' | 'round5'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchScores = useCallback(async () => {
    try {
      if (activeRound === 'round2') {
        const res = await fetch('/api/admin/phase/2/leaderboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } else if (activeRound === 'round3') {
        const res = await fetch('/api/admin/round3/leaderboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } else if (activeRound === 'round5') {
        const res = await fetch('/api/admin/round5/leaderboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      }
      setLastRefreshed(Date.now());
    } catch {
      // ignore network blips on live screen
    } finally {
      setLoading(false);
    }
  }, [activeRound]);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 3000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  const rows = data?.rows || [];
  const top1 = rows[0];
  const top2 = rows[1];
  const top3 = rows[2];

  return (
    <div
      className="ambient-glow-bg"
      style={{
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'var(--font-body)',
        padding: '28px 36px',
        overflowX: 'hidden',
      }}
    >
      {/* Top Banner & Controls */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(229, 9, 20, 0.35)',
          paddingBottom: 20,
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              background: 'var(--red)',
              color: '#fff',
              fontSize: 20,
              letterSpacing: '0.08em',
              padding: '6px 16px',
              borderRadius: 6,
              boxShadow: '0 0 24px rgba(229,9,20,0.6)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>LIVE STAGE</span>
          </div>
          <div>
            <span className="eyebrow" style={{ display: 'block', fontSize: 11, letterSpacing: '0.16em', marginBottom: 2 }}>
              ENGINEERS&rsquo; DAY 2026 // OFFICIAL TOURNAMENT ARENA
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 34,
                margin: 0,
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              COOK <span style={{ color: 'var(--red)' }}>OR</span> GET COOKED
            </h1>
          </div>
        </div>

        {/* Round Switcher Tabs */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => setActiveRound('round2')}
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.04em',
              padding: '10px 20px',
              borderRadius: 8,
              border: activeRound === 'round2' ? '2px solid var(--red)' : '1px solid #333',
              background: activeRound === 'round2' ? 'rgba(229,9,20,0.25)' : 'rgba(20,20,20,0.8)',
              color: activeRound === 'round2' ? '#fff' : '#aaa',
              cursor: 'pointer',
              fontSize: 16,
              boxShadow: activeRound === 'round2' ? '0 0 20px rgba(229,9,20,0.4)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🔥 Round 2 (MCQ Blitz)
          </button>
          <button
            onClick={() => setActiveRound('round3')}
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.04em',
              padding: '10px 20px',
              borderRadius: 8,
              border: activeRound === 'round3' ? '2px solid var(--gold)' : '1px solid #333',
              background: activeRound === 'round3' ? 'rgba(245,197,24,0.25)' : 'rgba(20,20,20,0.8)',
              color: activeRound === 'round3' ? 'var(--gold)' : '#aaa',
              cursor: 'pointer',
              fontSize: 16,
              boxShadow: activeRound === 'round3' ? '0 0 20px rgba(245,197,24,0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🤖 Round 3 (Human vs AI)
          </button>
          <button
            onClick={() => setActiveRound('round5')}
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.04em',
              padding: '10px 20px',
              borderRadius: 8,
              border: activeRound === 'round5' ? '2px solid #00E5FF' : '1px solid #333',
              background: activeRound === 'round5' ? 'rgba(0,229,255,0.25)' : 'rgba(20,20,20,0.8)',
              color: activeRound === 'round5' ? '#00E5FF' : '#aaa',
              cursor: 'pointer',
              fontSize: 16,
              boxShadow: activeRound === 'round5' ? '0 0 20px rgba(0,229,255,0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            👑 Round 5 (Grand Finale)
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              fontFamily: 'var(--font-mono)',
              padding: '9px 16px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: '1px solid #444',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
      </header>

      {/* Top 3 Podium (Shown when scores exist) */}
      {rows.length > 0 && rows[0]?.score !== null && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            maxWidth: 1160,
            margin: '0 auto 40px',
            alignItems: 'flex-end',
          }}
        >
          {/* #2 Silver */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(180deg, rgba(38,38,38,0.9) 0%, rgba(18,18,18,0.95) 100%)',
              border: '2px solid #c0c0c0',
              borderRadius: 16,
              padding: '28px 22px',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(192,192,192,0.25)',
              minHeight: 205,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 4 }}>🥈</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#c0c0c0', letterSpacing: '0.06em' }}>
              RANK #2 &middot; SILVER
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '8px 0 4px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.02em' }}>
              {top2?.teamName || '—'}
            </h3>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#e0e0e0', fontFamily: 'var(--font-mono)' }}>
              {top2?.score !== null && top2?.score !== undefined ? `${top2.score} pts` : '—'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {top2 ? fmtTime(top2.timeTakenSeconds) : ''}
            </div>
          </div>

          {/* #1 Gold (Taller Center) */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(180deg, rgba(46, 36, 12, 0.95) 0%, rgba(20, 15, 6, 0.98) 100%)',
              border: '3px solid var(--gold)',
              borderRadius: 18,
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 0 55px rgba(245,197,24,0.45)',
              minHeight: 250,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transform: 'scale(1.05)',
            }}
          >
            <div style={{ fontSize: 50, marginBottom: 4 }}>👑 🥇</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold)', letterSpacing: '0.08em' }}>
              LEADER &middot; CHAMPION #1
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, margin: '8px 0 4px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.02em' }}>
              {top1?.teamName || '—'}
            </h2>
            <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-mono)', textShadow: '0 0 20px rgba(245,197,24,0.5)' }}>
              {top1?.score !== null && top1?.score !== undefined ? `${top1.score} pts` : '—'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {top1 ? fmtTime(top1.timeTakenSeconds) : ''}
            </div>
          </div>

          {/* #3 Bronze */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(180deg, rgba(40, 24, 14, 0.9) 0%, rgba(18, 12, 7, 0.95) 100%)',
              border: '2px solid #cd7f32',
              borderRadius: 16,
              padding: '28px 22px',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(205,127,50,0.25)',
              minHeight: 195,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 4 }}>🥉</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#cd7f32', letterSpacing: '0.06em' }}>
              RANK #3 &middot; BRONZE
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '8px 0 4px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.02em' }}>
              {top3?.teamName || '—'}
            </h3>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#cd7f32', fontFamily: 'var(--font-mono)' }}>
              {top3?.score !== null && top3?.score !== undefined ? `${top3.score} pts` : '—'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {top3 ? fmtTime(top3.timeTakenSeconds) : ''}
            </div>
          </div>
        </section>
      )}

      {/* Main Leaderboard Table */}
      <div
        className="glass-card"
        style={{
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          maxWidth: 1200,
          margin: '0 auto',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            padding: '18px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(24, 24, 24, 0.9)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--red)', letterSpacing: '0.06em' }}>
            LIVE LEADERBOARD STANDINGS ({rows.length} REGISTERED TEAMS)
          </span>
          <span style={{ fontSize: 12, color: '#888', fontFamily: 'var(--font-mono)' }}>
            ⚡ Auto-refreshing (3s) &middot; Updated: {new Date(lastRefreshed).toLocaleTimeString()}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(14, 14, 14, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: 13 }}>
              <th style={{ padding: '14px 24px', width: 110, fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em' }}>RANK</th>
              <th style={{ padding: '14px 24px', fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em' }}>TEAM NAME</th>
              <th style={{ padding: '14px 24px', fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em' }}>SCORE</th>
              <th style={{ padding: '14px 24px', fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em' }}>TIME TAKEN</th>
              <th style={{ padding: '14px 24px', fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em' }}>ACCURACY</th>
              <th style={{ padding: '14px 24px', textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isTop3 = idx < 3;
              return (
                <tr
                  key={row.teamId || idx}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isTop3 ? 'rgba(245,197,24,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: 16 }}>
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 16, fontWeight: 700 }}>
                    {row.teamName}
                  </td>
                  <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>
                    {row.score !== null && row.score !== undefined ? `${row.score} pts` : '—'}
                  </td>
                  <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', color: '#aaa', fontSize: 14 }}>
                    {fmtTime(row.timeTakenSeconds)}
                  </td>
                  <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', color: '#aaa', fontSize: 14 }}>
                    {row.correct !== null && row.correct !== undefined ? `${row.correct} / ${row.attempted || row.totalQuestions || 25}` : '—'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {row.score === null || row.score === undefined ? (
                      <span className="chip" style={{ background: 'rgba(255,255,255,0.05)', color: '#888', fontSize: 12 }}>
                        In Progress
                      </span>
                    ) : row.passed ? (
                      <span className="chip green" style={{ fontWeight: 700, fontSize: 12 }}>
                        QUALIFIED 🏆
                      </span>
                    ) : (
                      <span className="chip red" style={{ fontWeight: 700, fontSize: 12 }}>
                        ELIMINATED 🍫
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
