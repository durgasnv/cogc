'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Web Audio API synth sounds (zero external file dependencies)
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'buzzer-open') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'win-buzz') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'lost-buzz') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // AudioContext blocked by browser policy until gesture
  }
}

export default function Round4ParticipantPage() {
  const [team, setTeam] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [buzzing, setBuzzing] = useState(false);
  const [buzzResult, setBuzzResult] = useState(null);
  const prevBuzzerOpen = useRef(false);
  const prevWinnerId = useRef(null);

  // 1. Fetch current logged-in team
  useEffect(() => {
    fetch('/api/team/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.team) setTeam(d.team);
      })
      .catch(() => {});
  }, []);

  // 2. Poll live game & buzzer state every 1000ms
  useEffect(() => {
    let isMounted = true;
    async function checkState() {
      try {
        const res = await fetch('/api/round4/state');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        // Sound effect on buzzer open
        if (!prevBuzzerOpen.current && data.buzzerOpen) {
          playSound('buzzer-open');
        }
        prevBuzzerOpen.current = data.buzzerOpen;

        // Sound effect when winner announced
        if (data.firstBuzz && data.firstBuzz.teamId !== prevWinnerId.current) {
          prevWinnerId.current = data.firstBuzz.teamId;
          if (team && data.firstBuzz.teamId === team.id) {
            playSound('win-buzz');
          } else {
            playSound('lost-buzz');
          }
        } else if (!data.firstBuzz) {
          prevWinnerId.current = null;
        }

        setGameState(data);
      } catch {
        // Network polling error
      }
    }

    checkState();
    const interval = setInterval(checkState, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [team]);

  // Handle slam buzzer action
  async function handleBuzz() {
    if (!gameState?.buzzerOpen || buzzing) return;
    setBuzzing(true);
    try {
      const res = await fetch('/api/team/round4/buzz', {
        method: 'POST',
      });
      const data = await res.json();
      setBuzzResult(data);
      if (data.first) {
        playSound('win-buzz');
      } else {
        playSound('lost-buzz');
      }
    } catch {
      setBuzzResult({ ok: false, message: 'Network glitch buzzing. Try again!' });
    } finally {
      setBuzzing(false);
    }
  }

  const isBuzzerOpen = !!gameState?.buzzerOpen;
  const firstBuzz = gameState?.firstBuzz;
  const isMyTeamWinner = team && firstBuzz && firstBuzz.teamId === team.id;
  const isOtherTeamWinner = team && firstBuzz && firstBuzz.teamId !== team.id;
  const teamScore = (team && gameState?.scores && gameState.scores[team.id]) || 0;

  return (
    <div className="page" style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="row-between mb-20" style={{ alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="chip" style={{ color: '#00E5FF', borderColor: '#00E5FF', background: 'rgba(0,229,255,0.08)' }}>
                ROUND 4 &middot; LIVE STAGE BUZZER
              </span>
              <span className="chip" style={{ color: 'var(--gold)', borderColor: 'var(--gold)', background: 'rgba(255,187,0,0.08)' }}>
                🎬 TELUGU MOVIES &amp; TRENDS
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, margin: '6px 0 0', letterSpacing: '0.02em' }}>
              Auditorium Charades <span style={{ color: 'var(--gold)' }}>Buzzer Arena</span>
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="muted small mono">TEAM LOGGED IN</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--white)' }}>
              {team?.name || 'Loading...'}
            </div>
            <div className="mono" style={{ color: 'var(--gold)', fontSize: 15, fontWeight: 'bold' }}>
              {teamScore} Points
            </div>
          </div>
        </div>

        {/* Category Indicator */}
        <div className="card mb-20 text-center" style={{ padding: '12px 18px', background: '#111', border: '1px solid #252525' }}>
          <span className="muted small mono" style={{ marginRight: 8 }}>ACTIVE CATEGORY:</span>
          <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: 16, fontFamily: 'var(--font-mono)' }}>
            {gameState?.activeCategory || 'Telugu Movies & Tech Trends'}
          </span>
        </div>

        {/* MAIN BUZZER INTERFACE */}
        <div
          className="card text-center mb-24"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px',
            background: isMyTeamWinner
              ? 'radial-gradient(circle, rgba(0,230,118,0.2) 0%, #0d0d0d 70%)'
              : isBuzzerOpen
              ? 'radial-gradient(circle, rgba(255,187,0,0.18) 0%, #0d0d0d 70%)'
              : '#0d0d0d',
            border: isMyTeamWinner
              ? '2px solid var(--green)'
              : isBuzzerOpen
              ? '2px solid var(--gold)'
              : '1px solid #222',
            boxShadow: isMyTeamWinner
              ? '0 0 50px rgba(0,230,118,0.4)'
              : isBuzzerOpen
              ? '0 0 50px rgba(255,187,0,0.3)'
              : 'none',
            borderRadius: 18,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Status Subtitle */}
          <div className="mb-24">
            {isMyTeamWinner ? (
              <div style={{ animation: 'pulse 1s infinite' }}>
                <span className="chip green mb-10" style={{ fontSize: 16, padding: '8px 18px' }}>
                  🎉 YOU BUZZED IN FIRST!
                </span>
                <h2 style={{ fontSize: 32, margin: '8px 0', color: 'var(--green)' }}>
                  SAY YOUR GUESS TO THE HOST NOW!
                </h2>
                <p className="mono muted" style={{ fontSize: 14 }}>
                  Reaction Speed: {firstBuzz.elapsedSeconds} seconds
                </p>
              </div>
            ) : isOtherTeamWinner ? (
              <div>
                <span className="chip red mb-10" style={{ fontSize: 15, padding: '6px 16px' }}>
                  ⚡ BUZZER LOCKED
                </span>
                <h2 style={{ fontSize: 26, margin: '8px 0', color: '#ff5252' }}>
                  {firstBuzz.teamName} Buzzed In First!
                </h2>
                <p className="mono muted" style={{ fontSize: 13 }}>
                  Speed: {firstBuzz.elapsedSeconds}s &middot; Stand by for host ruling...
                </p>
              </div>
            ) : isBuzzerOpen ? (
              <div>
                <span className="chip gold mb-10" style={{ fontSize: 16, padding: '8px 20px', animation: 'bounce 0.8s infinite' }}>
                  🔥 BUZZER IS LIVE!
                </span>
                <h2 style={{ fontSize: 28, margin: '6px 0', color: 'var(--white)' }}>
                  SLAM THE BUTTON TO GUESS!
                </h2>
                <p className="muted small">First team to tap wins the floor!</p>
              </div>
            ) : (
              <div>
                <span className="chip mb-10" style={{ color: '#888', borderColor: '#444' }}>
                  🔒 BUZZER LOCKED
                </span>
                <h2 style={{ fontSize: 24, margin: '6px 0', color: '#666' }}>
                  Watch the Stage Performance...
                </h2>
                <p className="muted small">Host will open the buzzer as soon as the actor begins!</p>
              </div>
            )}
          </div>

          {/* THE MASSIVE BUZZER BUTTON */}
          <button
            type="button"
            disabled={!isBuzzerOpen || buzzing}
            onClick={handleBuzz}
            style={{
              width: 220,
              height: 220,
              borderRadius: '50%',
              border: isMyTeamWinner
                ? '6px solid #00E676'
                : isBuzzerOpen
                ? '6px solid #FFB800'
                : '6px solid #333',
              background: isMyTeamWinner
                ? 'radial-gradient(circle, #00E676 0%, #00701a 100%)'
                : isBuzzerOpen
                ? 'radial-gradient(circle, #FFB800 0%, #E50914 100%)'
                : 'radial-gradient(circle, #252525 0%, #111 100%)',
              color: isBuzzerOpen || isMyTeamWinner ? '#000' : '#555',
              cursor: isBuzzerOpen ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-display)',
              fontSize: 34,
              letterSpacing: '0.04em',
              fontWeight: 900,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: isBuzzerOpen
                ? '0 12px 35px rgba(229,9,20,0.5), inset 0 3px 6px rgba(255,255,255,0.4)'
                : 'none',
              transform: isBuzzerOpen ? 'scale(1.04)' : 'scale(1)',
              transition: 'all 0.15s ease-in-out',
              userSelect: 'none',
              outline: 'none',
            }}
          >
            <span style={{ fontSize: 48, lineHeight: 1 }}>
              {isMyTeamWinner ? '🏆' : isBuzzerOpen ? '🚨' : '🔒'}
            </span>
            <span style={{ marginTop: 6, fontSize: 24 }}>
              {isMyTeamWinner ? 'WINNER!' : isBuzzerOpen ? 'BUZZ!' : 'LOCKED'}
            </span>
          </button>

          {/* Local Feedback */}
          {buzzResult && !buzzResult.first && (
            <p className="mt-16 mono small" style={{ color: '#ff5252' }}>
              {buzzResult.message}
            </p>
          )}
        </div>

        {/* Live Leaderboard / Standings */}
        <div className="card" style={{ padding: 20, background: '#111', border: '1px solid #222' }}>
          <div className="row-between mb-12">
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>ROUND 4 LIVE LEADERBOARD</span>
            <span className="mono small muted">Top Teams Advancing to Grand Finale</span>
          </div>

          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {gameState?.scores && Object.keys(gameState.scores).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {Object.entries(gameState.scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tId, pts], idx) => (
                    <div
                      key={tId}
                      style={{
                        background: tId === team?.id ? 'rgba(255,187,0,0.1)' : '#161616',
                        border: tId === team?.id ? '1px solid var(--gold)' : '1px solid #252525',
                        padding: '10px 14px',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span className="mono muted small" style={{ marginRight: 6 }}>#{idx + 1}</span>
                        <strong style={{ fontSize: 13, color: tId === team?.id ? 'var(--gold)' : '#fff' }}>
                          {tId.toUpperCase()}
                        </strong>
                      </div>
                      <span className="mono font-bold" style={{ color: 'var(--gold)', fontSize: 15 }}>
                        {pts} pts
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="muted small text-center" style={{ margin: '14px 0' }}>
                No points awarded yet. Fast buzzers and correct guesses win 100 points!
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-20 text-center">
          <Link href="/participant/dashboard" className="btn btn-ghost">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
