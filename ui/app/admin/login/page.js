'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        setLoading(false);
        return;
      }
      router.push('/admin/dashboard');
    } catch {
      setError('Network error — try again.');
      setLoading(false);
    }
  }

  return (
    <div className="center-screen">
      <div className="card card-lg" style={{ width: 420 }}>
        <p className="eyebrow mb-8">Controller access</p>
        <h1 style={{ fontSize: 40, marginBottom: 24 }}>Event control</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="password">Admin password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Enter dashboard'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
        <p className="hint-text mt-24">
          <Link href="/" className="muted">&larr; Back</Link> &nbsp;&middot;&nbsp; Looking for the participant login?{' '}
          <Link href="/participant/login" style={{ color: 'var(--red-light)' }}>Go here</Link>
        </p>
      </div>
    </div>
  );
}
