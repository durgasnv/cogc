'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCDebugSet,
  getSuitcaseLockSet,
  ROUND5_TIME_LIMIT_SECONDS,
} from '@/lib/round5Data';
import { getRandomCongratsImage, getRandomSorryImage } from '@/lib/memes';
import AntiCheatShield from '@/components/AntiCheatShield';

function fmtClock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Round5PlayPage() {
  const router = useRouter();
  const [selectedSet, setSelectedSet] = useState(1);
  const [status, setStatus] = useState('ready'); // ready | playing | finished
  const [activeTab, setActiveTab] = useState(0); // 0..4 for the 5 C questions, 5 for suitcase lock
  const [userExplanations, setUserExplanations] = useState({});
  const [userOutputs, setUserOutputs] = useState({});
  const [suitcaseDigits, setSuitcaseDigits] = useState(['', '', '', '', '', '', '', '', '']);
  const [lockFeedback, setLockFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND5_TIME_LIMIT_SECONDS);
  const timerRef = useRef(null);
  const [activeMeme, setActiveMeme] = useState('');

  // Randomize / assign set based on logged in team
  useEffect(() => {
    fetch('/api/team/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.team?.id) {
          let hash = 0;
          for (let i = 0; i < d.team.id.length; i++) hash = (hash * 31 + d.team.id.charCodeAt(i)) % 4;
          setSelectedSet(Math.abs(hash) + 1);
        } else {
          setSelectedSet(Math.floor(Math.random() * 4) + 1);
        }
      })
      .catch(() => setSelectedSet(Math.floor(Math.random() * 4) + 1));
  }, []);

  // 15-minute countdown timer
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const questions = getCDebugSet(selectedSet);
  const currentQ = questions[activeTab] || questions[0];

  function startRound() {
    setTimeLeft(ROUND5_TIME_LIMIT_SECONDS);
    setActiveTab(0);
    setStatus('playing');
  }

  function handleDigitChange(idx, val) {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...suitcaseDigits];
    updated[idx] = clean;
    setSuitcaseDigits(updated);

    // Auto-advance to next digit input if filled
    if (clean && idx < 8) {
      const nextInput = document.getElementById(`digit-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  }

  async function handleUnlockAttempt() {
    const entered = suitcaseDigits.join('');
    if (entered.length < 9) {
      setLockFeedback({ success: false, message: 'Please enter all 9 digits of the suitcase combination.' });
      return;
    }
    try {
      const res = await fetch('/api/team/round5/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: entered }),
      });
      const data = await res.json();
      setLockFeedback({
        success: data.valid,
        message: data.message || (data.valid ? '🎉 SUITCASE UNLOCKED!' : '🔒 Incorrect combination.'),
      });
    } catch {
      setLockFeedback({ success: false, message: 'Network error verifying code. Try again.' });
    }
  }

  function finishRound() {
    clearInterval(timerRef.current);
    setStatus('finished');
    const meme = getRandomCongratsImage();
    setActiveMeme(meme);
  }

  if (status === 'ready') {
    return (
      <div className="center-screen">
        <div className="card card-lg text-center" style={{ maxWidth: 560, border: '2px solid var(--red)', boxShadow: '0 0 45px rgba(229,9,20,0.35)' }}>
          <p className="eyebrow mb-8" style={{ color: 'var(--red)', fontWeight: 800 }}>ROUND 5 &middot; THE GRAND FINALE</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: '0.03em', marginBottom: 16, lineHeight: 1 }}>
            C Code Debugging &amp; <span style={{ color: 'var(--gold)' }}>Suitcase Lock</span>
          </h1>
          <p className="muted mb-20" style={{ fontSize: 15, lineHeight: 1.6 }}>
            Debug 5 challenging C programs across Easy, Medium, and Hard tiers.
            <br />
            Inspect the buggy code, identify the logic flaw, calculate the correct output, and unlock the final <strong>9-Digit Suitcase Lock</strong>!
          </p>

          <div style={{ marginBottom: 24, textAlign: 'center', background: 'rgba(24, 24, 24, 0.9)', padding: 14, borderRadius: 10, border: '1px solid #333' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.05em' }}>
              🎲 CHALLENGE SET: Dynamic Randomized Assignment
            </span>
          </div>

          <button
            className="btn btn-primary btn-block"
            style={{ fontFamily: 'var(--font-display)', height: 50, fontSize: 22, letterSpacing: '0.05em' }}
            onClick={startRound}
          >
            ENTER FINALE CHAMBER (25:00) 👑
          </button>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="page">
        <div className="container quiz-wrap text-center">
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>Grand Finale Complete</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 12, letterSpacing: '0.03em' }}>
            🏁 TOURNAMENT FINALE SUBMITTED!
          </h1>
          <p className="muted mb-20" style={{ fontFamily: 'var(--font-mono)' }}>
            Set {selectedSet} &middot; 5 C Problems &amp; Suitcase Lock Attempted
          </p>

          <div className="status-banner win" style={{ fontSize: 18, padding: 18, fontWeight: 'bold', marginBottom: 20 }}>
            👑 GRAND FINALE CHALLENGE CONCLUDED! Awaiting stage unlock verification! 🔥
          </div>

          {activeMeme && (
            <div style={{ margin: '20px auto', maxWidth: 380, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--gold)', boxShadow: '0 0 30px rgba(255,187,0,0.3)' }}>
              <img src={activeMeme} alt="Victory Meme" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <Link href="/participant/dashboard" className="btn btn-primary" style={{ padding: '12px 28px' }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const timerPct = Math.max((timeLeft / ROUND5_TIME_LIMIT_SECONDS) * 100, 0);

  return (
    <div className="page">
      <AntiCheatShield enabled={status === 'playing'} roundName="Round 5" />
      <div className="container" style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 16px' }}>
        {/* Top Header & Countdown */}
        <div className="row-between mb-16" style={{ alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--red)' }}>ROUND 5 &middot; FINALE (SET {selectedSet})</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: '4px 0 0', letterSpacing: '0.03em' }}>
              C Debugging &amp; <span style={{ color: 'var(--gold)' }}>Suitcase Unlock</span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="muted small mono" style={{ display: 'block' }}>TIME REMAINING</span>
            <span className={`timer-clock${timeLeft <= 60 ? ' low' : ''}`} style={{ fontSize: 28, fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              {fmtClock(timeLeft)}
            </span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="timer-track mb-20" style={{ height: 6 }}>
          <div className="timer-fill" style={{ width: `${timerPct}%`, background: 'var(--red)' }} />
        </div>

        {/* Problem Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {questions.map((q, idx) => (
            <button
              key={q.q}
              className={`btn ${activeTab === idx ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.03em', padding: '8px 16px' }}
              onClick={() => setActiveTab(idx)}
            >
              Q{q.q}: {q.title} ({q.difficulty})
            </button>
          ))}
          <button
            className={`btn ${activeTab === 5 ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              letterSpacing: '0.03em',
              padding: '8px 16px',
              borderColor: 'var(--gold)',
              color: activeTab === 5 ? '#000' : 'var(--gold)',
              background: activeTab === 5 ? 'var(--gold)' : 'transparent',
              fontWeight: 'bold',
            }}
            onClick={() => setActiveTab(5)}
          >
            🔒 9-Digit Suitcase Lock
          </button>
        </div>

        {/* Main Content Area */}
        {activeTab < 5 && currentQ && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 20 }}>
            {/* Left: Code Viewer */}
            <div className="card" style={{ padding: 20, background: '#111', border: '1px solid #2a2a2a' }}>
              <div className="row-between mb-12" style={{ alignItems: 'center' }}>
                <div>
                  <span
                    className="chip"
                    style={{
                      marginRight: 8,
                      borderColor: currentQ.difficulty === 'Hard' ? 'var(--red)' : currentQ.difficulty === 'Medium' ? 'var(--gold)' : 'var(--green)',
                      color: currentQ.difficulty === 'Hard' ? 'var(--red)' : currentQ.difficulty === 'Medium' ? 'var(--gold)' : 'var(--green)',
                    }}
                  >
                    {currentQ.difficulty.toUpperCase()}
                  </span>
                  <span className="muted small mono">{currentQ.topic}</span>
                </div>
                <span className="mono small" style={{ color: 'var(--gold)' }}>File: buggy.c</span>
              </div>

              <h3 style={{ fontSize: 18, marginBottom: 14 }}>{currentQ.title}</h3>

              {/* Code display with line numbers */}
              <pre
                style={{
                  background: '#0a0a0a',
                  padding: 16,
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.55,
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto',
                  border: '1px solid #222',
                  color: '#e6e6e6',
                }}
              >
                <code>{currentQ.buggyCode}</code>
              </pre>
            </div>

            {/* Right: Test Cases & Solution Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Challenge Objective */}
              <div className="card" style={{ padding: 18, background: '#141414', border: '1px solid #2a2a2a' }}>
                <p className="eyebrow mb-8" style={{ color: 'var(--gold)' }}>DEBUGGING OBJECTIVE</p>
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  Trace the execution of this C program. Identify the exact line containing the logical bug, explain the root cause, and determine the output produced by the buggy code.
                </p>
              </div>

              {/* Your Analysis & Fix */}
              <div className="card" style={{ padding: 18, background: '#141414', border: '1px solid #2a2a2a', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p className="eyebrow mb-8" style={{ color: 'var(--red)' }}>BUG IDENTIFICATION &amp; FIX</p>
                <textarea
                  className="input mb-12"
                  rows={4}
                  placeholder="Explain the bug in the code (which line and why it causes wrong output)..."
                  value={userExplanations[currentQ.q] || ''}
                  onChange={(e) => setUserExplanations({ ...userExplanations, [currentQ.q]: e.target.value })}
                  style={{ width: '100%', resize: 'none', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                />
                <input
                  type="text"
                  className="input mb-16"
                  placeholder="Output produced by the buggy code..."
                  value={userOutputs[currentQ.q] || ''}
                  onChange={(e) => setUserOutputs({ ...userOutputs, [currentQ.q]: e.target.value })}
                  style={{ width: '100%', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                />
                <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                  {activeTab > 0 && (
                    <button className="btn btn-ghost" onClick={() => setActiveTab(activeTab - 1)}>
                      &larr; Previous
                    </button>
                  )}
                  {activeTab < 4 ? (
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setActiveTab(activeTab + 1)}>
                      Next Question &rarr;
                    </button>
                  ) : (
                    <button
                      className="btn"
                      style={{ flex: 1, background: 'var(--gold)', color: '#000', fontWeight: 'bold', fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.03em' }}
                      onClick={() => setActiveTab(5)}
                    >
                      GO TO SUITCASE LOCK 🔒
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suitcase Lock Tab */}
        {activeTab === 5 && (
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div className="card mb-24" style={{ textAlign: 'center', padding: '26px 20px', border: '2px solid var(--gold)', boxShadow: '0 0 40px rgba(255,187,0,0.2)' }}>
              <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,187,0,0.15)', border: '1px solid var(--gold)', borderRadius: 20, color: 'var(--gold)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                🔒 THE 9-DIGIT SUITCASE COMBINATION CODES
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: '0.03em', marginBottom: 8 }}>
                CRACK THE 3 C CODES TO REVEAL THE COMBINATION
              </h2>
              <p className="muted" style={{ fontSize: 15, maxWidth: 680, margin: '0 auto', lineHeight: 1.5 }}>
                Each C code below outputs a 3-digit number. Combine the three 3-digit outputs in order to reveal the 9-digit master combination!
              </p>
            </div>

            {/* 3 C Coding Questions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
              {getSuitcaseLockSet(selectedSet).keys.map((k) => (
                <div key={k.keyNumber} className="card" style={{ padding: 18, background: '#111', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column' }}>
                  <div className="row-between mb-10" style={{ alignItems: 'center' }}>
                    <span className="chip" style={{ color: 'var(--gold)', borderColor: 'var(--gold)', background: 'rgba(255,187,0,0.1)', fontFamily: 'var(--font-mono)' }}>
                      🔑 {k.segment}
                    </span>
                    <span className="mono small muted">{k.title}</span>
                  </div>
                  <pre
                    style={{
                      background: '#070707',
                      padding: 14,
                      borderRadius: 6,
                      fontSize: 12.5,
                      lineHeight: 1.45,
                      fontFamily: 'var(--font-mono)',
                      overflowX: 'auto',
                      border: '1px solid #1a1a1a',
                      color: '#e6e6e6',
                      flex: 1,
                      margin: 0,
                    }}
                  >
                    <code>{k.code}</code>
                  </pre>
                </div>
              ))}
            </div>

            {/* 9-Digit Suitcase Lock Dialer Box */}
            <div className="card text-center" style={{ padding: 32, border: '2px solid var(--gold)', boxShadow: '0 0 40px rgba(255,187,0,0.25)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '0.03em', marginBottom: 6, color: 'var(--gold)' }}>
                ENTER COMBINED 9-DIGIT COMBINATION
              </h3>
              <p className="muted mb-20 mono" style={{ fontSize: 13 }}>
                [ Code 1: Digits 1-3 ] &nbsp;&bull;&nbsp; [ Code 2: Digits 4-6 ] &nbsp;&bull;&nbsp; [ Code 3: Digits 7-9 ]
              </p>

              {/* 9 Digits Input Grid */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                {suitcaseDigits.map((digit, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      id={`digit-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      style={{
                        width: 46,
                        height: 54,
                        fontSize: 26,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        background: '#0a0a0a',
                        border: digit ? '2px solid var(--gold)' : '1px solid #444',
                        borderRadius: 8,
                        color: '#fff',
                        boxShadow: digit ? '0 0 12px rgba(245,197,24,0.3)' : 'none',
                      }}
                    />
                    {(idx === 2 || idx === 5) && (
                      <span style={{ margin: '0 8px', color: '#666', fontSize: 18, fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>&bull;</span>
                    )}
                  </div>
                ))}
              </div>

              {lockFeedback && (
                <div
                  className={`status-banner ${lockFeedback.success ? 'win' : 'fail'} mb-20`}
                  style={{ fontSize: 15, padding: 14, fontWeight: 'bold' }}
                >
                  {lockFeedback.message}
                </div>
              )}

              <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '14px 36px', fontSize: 18, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', background: 'linear-gradient(135deg, #FFB800 0%, #E50914 100%)', color: '#000', fontWeight: 'bold' }}
                  onClick={handleUnlockAttempt}
                >
                  🔓 TEST UNLOCK CODE
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '14px 28px', fontSize: 18, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
                  onClick={finishRound}
                >
                  🏁 FINAL SUBMIT ROUND 5
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
