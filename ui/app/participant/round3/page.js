'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sampleRandomRound3Questions, ROUND3_TIME_LIMIT_SECONDS, ROUND3_PASS_PERCENTAGE } from '@/lib/round3TuringData';
import { getRandomCongratsImage, getRandomSorryImage } from '@/lib/memes';

function fmtClock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Round3PlayPage() {
  const router = useRouter();
  const [status, setStatus] = useState('ready'); // ready | playing | finished
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // { qId: 'CHOICE_1' | 'CHOICE_2' }
  const [timeLeft, setTimeLeft] = useState(ROUND3_TIME_LIMIT_SECONDS); // 300s (5 mins)
  const [finalScore, setFinalScore] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef(null);
  const [activeMeme, setActiveMeme] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  // Check auth on load and verify qualification
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/team/me');
      if (res.status === 401) {
        router.push('/participant/login');
        return;
      }
      const data = await res.json();
      if (data.isEliminated && data.eliminatedInRound < 3) {
        setAccessDenied(true);
      }
    }
    checkAuth();
  }, [router]);

  // Sample 20 randomized questions from the master question bank with flipped layouts
  function startRound() {
    const sampled = sampleRandomRound3Questions(20);

    setShuffledQuestions(sampled);
    setUserAnswers({});
    setCurrentIndex(0);
    setTimeLeft(ROUND3_TIME_LIMIT_SECONDS);
    setActiveMeme('');
    setStatus('playing');
  }

  // 4 Minute Timer
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

  const currentQ = shuffledQuestions[currentIndex];

  function handleSelect(choice) {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: choice,
    }));
  }

  function finishRound() {
    clearInterval(timerRef.current);
    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    shuffledQuestions.forEach((q) => {
      const isChoice1Correct = q.answerForA === 'Human' && q.answerForB === 'AI';
      const expectedChoice = isChoice1Correct ? 'CHOICE_1' : 'CHOICE_2';
      const chosen = userAnswers[q.id];

      if (chosen) {
        attempted += 1;
        if (chosen === expectedChoice) correct += 1;
        else wrong += 1;
      }
    });

    const score = correct * 100;
    const totalPossible = shuffledQuestions.length * 100;
    const passingScore = Math.ceil((totalPossible * ROUND3_PASS_PERCENTAGE) / 100);
    const passed = score >= passingScore;
    const timeTakenSeconds = Math.max(ROUND3_TIME_LIMIT_SECONDS - timeLeft, 1);
    const memeUrl = passed ? getRandomCongratsImage() : getRandomSorryImage();
    setActiveMeme(memeUrl);

    const payload = {
      score,
      correct,
      wrong,
      attempted,
      totalQuestions: shuffledQuestions.length,
      timeTakenSeconds,
      passed,
      memeUrl,
    };

    setFinalScore(payload);
    setStatus('finished');

    // Persist score to server
    fetch('/api/team/round3/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  // Helper to render code snippet vs prose
  const renderSolutionContent = (text) => {
    const isCode = text.includes('def ') || text.includes('#include') || text.includes('for ') || text.includes('while ') || text.includes('print(');
    return (
      <div
        className={isCode ? 'code-block' : 'solution-text'}
        style={{
          marginTop: 10,
          minHeight: 90,
          background: isCode ? '#0a0a0a' : 'transparent',
          padding: isCode ? 14 : 0,
        }}
      >
        {text}
      </div>
    );
  };

  if (accessDenied) {
    return (
      <div className="center-screen">
        <div className="card card-lg text-center" style={{ maxWidth: 480 }}>
          <p className="eyebrow mb-8">Access Locked</p>
          <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--red)' }}>Round 3 Access Restricted</h2>
          <p className="muted mb-24">Your team did not advance past Round 2. Thanks for participating!</p>
          <Link href="/participant/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="center-screen">
        <div className="card card-lg text-center" style={{ maxWidth: 540 }}>
          <p className="eyebrow mb-8">Round 3 &middot; Turing Showdown</p>
          <h1 style={{ fontSize: 44, marginBottom: 16, color: 'var(--white)' }}>
            HUMAN <span style={{ color: 'var(--red)' }}>VS</span> AI
          </h1>
          <p className="muted mb-24" style={{ lineHeight: 1.6, fontSize: 15 }}>
            You will be presented with <strong>20 randomly selected Turing challenges</strong> drawn from the master question bank.
            Spot which solution is Human and which is AI.
          </p>
          <div className="row-between small mono muted mb-24" style={{ background: 'var(--bg-input)', padding: '14px 18px', borderRadius: 8 }}>
            <span>TIME: <strong style={{ color: 'var(--red-light)' }}>15:00</strong></span>
            <span>TOTAL QUESTIONS: <strong style={{ color: 'var(--white)' }}>20</strong></span>
            <span>PASS CUTOFF: <strong style={{ color: 'var(--green)' }}>60%</strong></span>
          </div>
          <button className="btn btn-primary btn-block" style={{ fontSize: 16, padding: '14px' }} onClick={startRound}>
            Start 20 Turing Challenges (15m)
          </button>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const r = finalScore;
    const currentMemeSrc = activeMeme || r.memeUrl;

    function shuffleMeme() {
      const nextMeme = r.passed ? getRandomCongratsImage(currentMemeSrc) : getRandomSorryImage(currentMemeSrc);
      setActiveMeme(nextMeme);
    }

    return (
      <div className="page">
        <div className="container quiz-wrap text-center" style={{ maxWidth: 880 }}>
          <p className="eyebrow">Round 3 Complete</p>
          <p className="result-score">{r.score}</p>
          <p className="muted mono mb-16">Human vs AI &middot; {r.correct}/{r.totalQuestions} Correct &middot; {r.timeTakenSeconds}s</p>

          {r.passed ? (
            <div>
              <div className="status-banner win" style={{ fontSize: '17px', padding: '16px', fontWeight: 'bold' }}>
                🔥 W RIZZ! YOU COOKED! Move front and to the next round! 🚀👑
              </div>
              <div style={{ margin: '20px auto', maxWidth: 360, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--green)', boxShadow: '0 0 25px rgba(70,211,105,0.3)' }}>
                <img
                  src={currentMemeSrc}
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
                  src={currentMemeSrc}
                  alt="Sorry Meme"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
              <button className="btn btn-ghost btn-sm mb-16" onClick={shuffleMeme}>
                🎲 Shuffle Sorry Meme
              </button>
            </div>
          )}

          <div className="stat-grid">
            <div className="stat"><div className="n win">{r.correct}</div><div className="lbl">Correct</div></div>
            <div className="stat"><div className="n lose">{r.wrong}</div><div className="lbl">Wrong</div></div>
            <div className="stat"><div className="n">{r.attempted}</div><div className="lbl">Attempted (of {r.totalQuestions})</div></div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <button className="btn btn-ghost" onClick={() => setShowReview(!showReview)}>
              {showReview ? 'Hide review' : `Review all ${shuffledQuestions.length} answers`}
            </button>
            <Link href="/participant/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Back to Dashboard
            </Link>
          </div>

          {showReview && (
            <div style={{ textAlign: 'left', marginTop: 32 }}>
              {shuffledQuestions.map((q, idx) => {
                const isChoice1Correct = q.answerForA === 'Human' && q.answerForB === 'AI';
                const expectedChoice = isChoice1Correct ? 'CHOICE_1' : 'CHOICE_2';
                const chosen = userAnswers[q.id];
                const isCorrect = chosen === expectedChoice;

                return (
                  <div key={q.id} className="card mb-16" style={{ borderColor: isCorrect ? 'var(--green)' : chosen ? 'var(--red)' : 'var(--border)' }}>
                    <div className="row-between mb-8">
                      <span className="mono eyebrow">Question {idx + 1} of {shuffledQuestions.length} &middot; {q.title}</span>
                      <span className={`chip ${isCorrect ? 'green' : chosen ? 'red' : ''}`}>
                        {isCorrect ? 'Correct +100' : chosen ? 'Wrong' : 'Skipped'}
                      </span>
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{q.prompt}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 12 }}>
                      <div style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid #222' }}>
                        <div className="row-between mb-4">
                          <span className="chip sm">Solution A</span>
                          <span className="mono small" style={{ color: q.answerForA === 'Human' ? 'var(--green)' : 'var(--blue)' }}>
                            Actual: {q.answerForA}
                          </span>
                        </div>
                        {renderSolutionContent(q.displayA)}
                      </div>

                      <div style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid #222' }}>
                        <div className="row-between mb-4">
                          <span className="chip sm">Solution B</span>
                          <span className="mono small" style={{ color: q.answerForB === 'Human' ? 'var(--green)' : 'var(--blue)' }}>
                            Actual: {q.answerForB}
                          </span>
                        </div>
                        {renderSolutionContent(q.displayB)}
                      </div>
                    </div>

                    <div className="row-between small muted mono" style={{ background: '#0a0a0a', padding: '8px 12px', borderRadius: 6 }}>
                      <span>Your Choice: <strong>{chosen === 'CHOICE_1' ? 'A = Human, B = AI' : chosen === 'CHOICE_2' ? 'A = AI, B = Human' : 'None'}</strong></span>
                      <span style={{ color: 'var(--green)' }}>Correct Key: {isChoice1Correct ? 'A = Human, B = AI' : 'A = AI, B = Human'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Test Arena View
  const selectedChoice = userAnswers[currentQ?.id];

  return (
    <div className="page">
      <nav className="topnav">
        <span className="brand">COOK <span>OR GET COOKED</span></span>
        <div className="nav-actions">
          <span className="badge-cat" style={{ background: 'rgba(229,9,20,0.15)', color: 'var(--red)', border: '1px solid var(--red)' }}>
            Round 3 · Turing Test
          </span>
          <span className="timer" style={{ color: timeLeft < 30 ? 'var(--red)' : 'var(--white)' }}>
            {fmtClock(timeLeft)}
          </span>
        </div>
      </nav>

      <div className="container quiz-wrap" style={{ maxWidth: 960 }}>
        {/* Top Progress & Palette */}
        <div className="card mb-16" style={{ padding: '16px 20px' }}>
          <div className="row-between mb-12">
            <span className="mono small muted">Question {currentIndex + 1} of {shuffledQuestions.length} &middot; {currentQ?.title}</span>
            <span className="mono small" style={{ color: 'var(--green)' }}>
              {Object.keys(userAnswers).length} / {shuffledQuestions.length} Answered
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {shuffledQuestions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    border: isCurrent ? '2px solid var(--red)' : isAnswered ? '1px solid var(--green)' : '1px solid #333',
                    background: isCurrent ? 'var(--red)' : isAnswered ? 'rgba(70,211,105,0.15)' : '#181818',
                    color: isCurrent ? '#fff' : isAnswered ? 'var(--green)' : 'var(--muted)',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Prompt Card */}
        <div className="card mb-20" style={{ borderLeft: '4px solid var(--red)' }}>
          <p className="eyebrow mb-8">Turing Challenge #{currentIndex + 1}</p>
          <h2 style={{ fontSize: 24, lineHeight: 1.4, color: 'var(--white)' }}>{currentQ?.prompt}</h2>
        </div>

        {/* Side-by-side Solutions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* Option A Box */}
          <div className="card" style={{ background: '#141414', border: '1px solid #282828', borderRadius: 10, padding: 18 }}>
            <div className="row-between mb-8">
              <span className="chip sm gold" style={{ fontWeight: 'bold' }}>SOLUTION A</span>
              <span className="mono small muted">Candidate 1</span>
            </div>
            {renderSolutionContent(currentQ?.displayA || '')}
          </div>

          {/* Option B Box */}
          <div className="card" style={{ background: '#141414', border: '1px solid #282828', borderRadius: 10, padding: 18 }}>
            <div className="row-between mb-8">
              <span className="chip sm blue" style={{ fontWeight: 'bold' }}>SOLUTION B</span>
              <span className="mono small muted">Candidate 2</span>
            </div>
            {renderSolutionContent(currentQ?.displayB || '')}
          </div>
        </div>

        {/* Selection Decision Buttons */}
        <div className="card mb-24 text-center" style={{ background: '#111', padding: 20 }}>
          <p className="eyebrow mb-16">Choose the correct identification:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button
              onClick={() => handleSelect('CHOICE_1')}
              style={{
                padding: '16px 14px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: selectedChoice === 'CHOICE_1' ? '2px solid var(--red)' : '1px solid #333',
                background: selectedChoice === 'CHOICE_1' ? 'rgba(229,9,20,0.2)' : '#181818',
                color: selectedChoice === 'CHOICE_1' ? 'var(--white)' : 'var(--muted)',
              }}
            >
              🅰️ Solution A = <strong>Human</strong><br />
              🅱️ Solution B = <strong>AI</strong>
            </button>

            <button
              onClick={() => handleSelect('CHOICE_2')}
              style={{
                padding: '16px 14px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: selectedChoice === 'CHOICE_2' ? '2px solid var(--red)' : '1px solid #333',
                background: selectedChoice === 'CHOICE_2' ? 'rgba(229,9,20,0.2)' : '#181818',
                color: selectedChoice === 'CHOICE_2' ? 'var(--white)' : 'var(--muted)',
              }}
            >
              🅰️ Solution A = <strong>AI</strong><br />
              🅱️ Solution B = <strong>Human</strong>
            </button>
          </div>
        </div>

        {/* Navigation Bottom Controls */}
        <div className="row-between">
          <button
            className="btn btn-ghost"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          >
            &larr; Previous Question
          </button>

          <div style={{ display: 'flex', gap: 12 }}>
            {currentIndex < shuffledQuestions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentIndex((prev) => Math.min(shuffledQuestions.length - 1, prev + 1))}
              >
                Next Question &rarr;
              </button>
            ) : (
              <button className="btn btn-primary" style={{ background: 'var(--green)', borderColor: 'var(--green)' }} onClick={finishRound}>
                Submit All 20 Challenges 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
