'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParticipantLoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/team/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        setLoading(false);
        return;
      }
      router.push('/participant/dashboard');
    } catch {
      setError('Network error — try again.');
      setLoading(false);
    }
  }

  return (
    <div className="center-screen">
      <div className="card card-lg" style={{ width: 420 }}>
        <p className="eyebrow mb-8">Engineers&rsquo; Day // Live Technical Fire Round</p>
        <h1 style={{ fontSize: 40, marginBottom: 24 }}>
          Team <span style={{ color: 'var(--red)' }}>login</span>
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Team name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Null Pointers"
              autoFocus
              required
            />
          </div>
          <div className="field">
            <label htmlFor="pin">Participant Password</label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Event password (e.g. 2026)"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Enter'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
        <p className="hint-text mt-24">
          <Link href="/" className="muted">&larr; Back</Link>
        </p>
      </div>
    </div>
  );
}
