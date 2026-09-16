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
      style={{
        minHeight: '100vh',
        background: '#070707',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px 32px',
        overflowX: 'hidden',
      }}
    >
      {/* Top Banner & Controls */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(229, 9, 20, 0.4)',
          paddingBottom: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              background: 'var(--red)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: 2,
              padding: '6px 14px',
              borderRadius: 6,
              boxShadow: '0 0 20px rgba(229,9,20,0.6)',
            }}
          >
            LIVE STAGE
          </div>
          <h1 style={{ fontSize: 26, margin: 0, fontWeight: 800, letterSpacing: 1 }}>
            COOK OR GET COOKED &middot; TOURNAMENT ARENA
          </h1>
        </div>

        {/* Round Switcher Tabs */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setActiveRound('round2')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeRound === 'round2' ? '2px solid var(--red)' : '1px solid #333',
              background: activeRound === 'round2' ? 'rgba(229,9,20,0.2)' : '#121212',
              color: activeRound === 'round2' ? 'var(--red)' : '#aaa',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            🔥 Round 2 (MCQ Blitz)
          </button>
          <button
            onClick={() => setActiveRound('round3')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeRound === 'round3' ? '2px solid var(--gold)' : '1px solid #333',
              background: activeRound === 'round3' ? 'rgba(255,187,0,0.2)' : '#121212',
              color: activeRound === 'round3' ? 'var(--gold)' : '#aaa',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            🤖 Round 3 (Human vs AI)
          </button>
          <button
            onClick={() => setActiveRound('round5')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeRound === 'round5' ? '2px solid #00E5FF' : '1px solid #333',
              background: activeRound === 'round5' ? 'rgba(0,229,255,0.2)' : '#121212',
              color: activeRound === 'round5' ? '#00E5FF' : '#aaa',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            👑 Round 5 (Grand Finale)
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: '#222',
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
            gap: 20,
            maxWidth: 1100,
            margin: '0 auto 36px',
            alignItems: 'flex-end',
          }}
        >
          {/* #2 Silver */}
          <div
            style={{
              background: 'linear-gradient(180deg, #202020 0%, #101010 100%)',
              border: '2px solid #c0c0c0',
              borderRadius: 14,
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 0 25px rgba(192,192,192,0.2)',
              minHeight: 190,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>🥈</div>
            <div style={{ fontSize: 13, color: '#aaa', fontWeight: 700, letterSpacing: 1 }}>RANK #2</div>
            <h3 style={{ fontSize: 22, margin: '6px 0', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {top2?.teamName || '—'}
            </h3>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#c0c0c0', fontFamily: 'monospace' }}>
              {top2?.score !== null && top2?.score !== undefined ? `${top2.score} pts` : '—'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              {top2 ? fmtTime(top2.timeTakenSeconds) : ''}
            </div>
          </div>

          {/* #1 Gold (Taller Center) */}
          <div
            style={{
              background: 'linear-gradient(180deg, #2a2208 0%, #120f04 100%)',
              border: '3px solid var(--gold)',
              borderRadius: 16,
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 0 45px rgba(255,187,0,0.4)',
              minHeight: 230,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transform: 'scale(1.05)',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 4 }}>👑 🥇</div>
            <div style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 800, letterSpacing: 2 }}>LEADER &middot; #1</div>
            <h2 style={{ fontSize: 26, margin: '6px 0', color: '#fff', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {top1?.teamName || '—'}
            </h2>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--gold)', fontFamily: 'monospace' }}>
              {top1?.score !== null && top1?.score !== undefined ? `${top1.score} pts` : '—'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 600 }}>
              {top1 ? fmtTime(top1.timeTakenSeconds) : ''}
            </div>
          </div>

          {/* #3 Bronze */}
          <div
            style={{
              background: 'linear-gradient(180deg, #24160d 0%, #110b06 100%)',
              border: '2px solid #cd7f32',
              borderRadius: 14,
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 0 25px rgba(205,127,50,0.2)',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>🥉</div>
            <div style={{ fontSize: 13, color: '#cd7f32', fontWeight: 700, letterSpacing: 1 }}>RANK #3</div>
            <h3 style={{ fontSize: 22, margin: '6px 0', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {top3?.teamName || '—'}
            </h3>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#cd7f32', fontFamily: 'monospace' }}>
              {top3?.score !== null && top3?.score !== undefined ? `${top3.score} pts` : '—'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              {top3 ? fmtTime(top3.timeTakenSeconds) : ''}
            </div>
          </div>
        </section>
      )}

      {/* Main Leaderboard Table */}
      <div
        style={{
          background: '#111',
          borderRadius: 14,
          border: '1px solid #222',
          overflow: 'hidden',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #222',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#161616',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)', letterSpacing: 1 }}>
            LIVE LEADERBOARD STANDINGS ({rows.length} TEAMS)
          </span>
          <span style={{ fontSize: 12, color: '#777', fontFamily: 'monospace' }}>
            Auto-refreshing &middot; Last updated: {new Date(lastRefreshed).toLocaleTimeString()}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#0e0e0e', borderBottom: '1px solid #222', color: '#888', fontSize: 13 }}>
              <th style={{ padding: '14px 20px', width: 90 }}>Rank</th>
              <th style={{ padding: '14px 20px' }}>Team Name</th>
              <th style={{ padding: '14px 20px' }}>Score</th>
              <th style={{ padding: '14px 20px' }}>Time Taken</th>
              <th style={{ padding: '14px 20px' }}>Correct / Total</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isTop3 = idx < 3;
              return (
                <tr
                  key={row.teamId || idx}
                  style={{
                    borderBottom: '1px solid #1a1a1a',
                    background: isTop3 ? 'rgba(255,187,0,0.03)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}
                >
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 16, fontWeight: 700 }}>
                    {row.teamName}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>
                    {row.score !== null && row.score !== undefined ? `${row.score} pts` : '—'}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#aaa' }}>
                    {fmtTime(row.timeTakenSeconds)}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#aaa' }}>
                    {row.correct !== null && row.correct !== undefined ? `${row.correct} / ${row.attempted || row.totalQuestions || 25}` : '—'}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    {row.score === null || row.score === undefined ? (
                      <span style={{ padding: '4px 10px', borderRadius: 4, background: '#222', color: '#888', fontSize: 12 }}>
                        In Progress
                      </span>
                    ) : row.passed ? (
                      <span style={{ padding: '4px 12px', borderRadius: 4, background: 'rgba(70,211,105,0.15)', color: 'var(--green)', border: '1px solid var(--green)', fontSize: 12, fontWeight: 700 }}>
                        QUALIFIED 🏆
                      </span>
                    ) : (
                      <span style={{ padding: '4px 12px', borderRadius: 4, background: 'rgba(229,9,20,0.15)', color: 'var(--red)', border: '1px solid var(--red)', fontSize: 12, fontWeight: 700 }}>
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
