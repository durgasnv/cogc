'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  cDebugQuestions,
  getCDebugSet,
  ROUND5_TIME_LIMIT_SECONDS,
  SUITCASE_LOCK_CONFIG,
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
        <div className="card card-lg text-center" style={{ maxWidth: 540, border: '2px solid var(--red)', boxShadow: '0 0 35px rgba(229,9,20,0.3)' }}>
          <p className="eyebrow mb-8" style={{ color: 'var(--red)', fontWeight: 800 }}>ROUND 5 &middot; THE GRAND FINALE</p>
          <h1 style={{ fontSize: 34, marginBottom: 16 }}>C Code Debugging & Suitcase Lock</h1>
          <p className="muted mb-20" style={{ fontSize: 15, lineHeight: 1.6 }}>
            Debug 5 challenging C programs across Easy, Medium, and Hard tiers.
            <br />
            Inspect the buggy code, identify the logic flaw, calculate the correct output, and unlock the final <strong>9-Digit Suitcase Lock</strong>!
          </p>

          <div style={{ marginBottom: 24, textAlign: 'left', background: '#181818', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--gold)', fontWeight: 700, marginBottom: 8 }}>
              Select Assigned Problem Set:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn ${selectedSet === s ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 14, fontWeight: 'bold' }}
                  onClick={() => setSelectedSet(s)}
                >
                  Set {s}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-block" style={{ height: 48, fontSize: 16 }} onClick={startRound}>
            Enter Finale Chamber (25:00)
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
          <h1 style={{ fontSize: 40, marginBottom: 12 }}>🏁 Tournament Finale Submitted!</h1>
          <p className="muted mb-20">Set {selectedSet} &middot; 5 C Problems &amp; Suitcase Lock Attempted</p>

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
            <h2 style={{ fontSize: 24, margin: '4px 0 0' }}>C Debugging &amp; Chest Unlock</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="muted small mono" style={{ display: 'block' }}>TIME REMAINING</span>
            <span className={`timer-clock${timeLeft <= 60 ? ' low' : ''}`} style={{ fontSize: 26, fontWeight: 'bold', fontFamily: 'monospace' }}>
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
              style={{ fontSize: 13, padding: '8px 16px' }}
              onClick={() => setActiveTab(idx)}
            >
              Q{q.q}: {q.title} ({q.difficulty})
            </button>
          ))}
          <button
            className={`btn ${activeTab === 5 ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              fontSize: 13,
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
                  lineHeight: 1.5,
                  fontFamily: 'Consolas, Monaco, monospace',
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
              {/* Test Case & Expected Output */}
              <div className="card" style={{ padding: 18, background: '#141414', border: '1px solid #2a2a2a' }}>
                <p className="eyebrow mb-8" style={{ color: 'var(--gold)' }}>TEST CASE &amp; BEHAVIOR</p>
                {currentQ.input && (
                  <div className="mb-12">
                    <span className="muted small" style={{ display: 'block', marginBottom: 4 }}>Standard Input:</span>
                    <div style={{ background: '#0a0a0a', padding: '6px 10px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>
                      {currentQ.input}
                    </div>
                  </div>
                )}
                <div>
                  <span className="muted small" style={{ display: 'block', marginBottom: 4 }}>Expected Correct Output:</span>
                  <div style={{ background: '#0a0a0a', padding: '6px 10px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, color: 'var(--green)', fontWeight: 'bold' }}>
                    {currentQ.expectedOutput}
                  </div>
                </div>
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
                  style={{ width: '100%', resize: 'none', fontSize: 13 }}
                />
                <input
                  type="text"
                  className="input mb-16"
                  placeholder="Output produced by the buggy code..."
                  value={userOutputs[currentQ.q] || ''}
                  onChange={(e) => setUserOutputs({ ...userOutputs, [currentQ.q]: e.target.value })}
                  style={{ width: '100%', fontSize: 13 }}
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
                      style={{ flex: 1, background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}
                      onClick={() => setActiveTab(5)}
                    >
                      Go to Suitcase Lock 🔒
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suitcase Lock Tab */}
        {activeTab === 5 && (
          <div className="card text-center" style={{ maxWidth: 720, margin: '0 auto', padding: 36, border: '2px solid var(--gold)', boxShadow: '0 0 35px rgba(255,187,0,0.2)' }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,187,0,0.15)', border: '1px solid var(--gold)', borderRadius: 20, color: 'var(--gold)', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
              🔒 GRAND FINALE SUITCASE COMBINATION
            </div>
            <h2 style={{ fontSize: 28, marginBottom: 8 }}>Enter the 9-Digit Unlock Combination</h2>
            <p className="muted mb-24" style={{ fontSize: 14, maxWidth: 540, margin: '0 auto 24px' }}>
              Enter the three 3-digit outputs derived from your C debugging problems to crack the physical/virtual combination lock.
            </p>

            {/* 9 Digits Input Grid */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              {suitcaseDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`digit-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  style={{
                    width: 48,
                    height: 56,
                    fontSize: 26,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    background: '#0a0a0a',
                    border: digit ? '2px solid var(--gold)' : '1px solid #444',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
              ))}
            </div>

            {lockFeedback && (
              <div
                className={`status-banner ${lockFeedback.success ? 'win' : 'fail'} mb-20`}
                style={{ fontSize: 14, padding: 12 }}
              >
                {lockFeedback.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '12px 32px', fontSize: 16, background: 'linear-gradient(135deg, #FFB800 0%, #E50914 100%)', color: '#000', fontWeight: 'bold' }}
                onClick={handleUnlockAttempt}
              >
                🔓 Test Unlock Code
              </button>
              <button className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 15 }} onClick={finishRound}>
                🏁 Final Submit Round 5
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
