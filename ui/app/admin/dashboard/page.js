'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

async function api(path, opts) {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('__UNAUTH__');
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function fmtTime(secs) {
  if (secs === null || secs === undefined || secs === Infinity) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [loadError, setLoadError] = useState('');

  const loadTeams = useCallback(async () => {
    try {
      const data = await api('/api/admin/teams');
      setTeams(data.teams || []);
    } catch (e) {
      if (e.message === '__UNAUTH__') { router.push('/admin/login'); return; }
      setLoadError(e.message);
    }
  }, [router]);

  async function handlePurgeTestData() {
    const confirmation = prompt('⚠️ DANGER: Type "RESET" to purge all test scores across all rounds.\n\n(Registered team names will remain safe):');
    if (confirmation !== 'RESET') {
      alert('Reset cancelled.');
      return;
    }
    try {
      const res = await api('/api/admin/reset', {
        method: 'POST',
        body: JSON.stringify({ confirm: 'RESET_TOURNAMENT_CONFIRMED' }),
      });
      alert(`✅ ${res.message}`);
      loadTeams();
    } catch (e) {
      alert(`Error resetting: ${e.message}`);
    }
  }

  function handleExportCSV() {
    window.location.href = '/api/admin/export';
  }

  function openProjector() {
    window.open('/projector', '_blank');
  }

  return (
    <div className="page">
      <nav className="topnav">
        <span className="brand">COOK <span>OR GET COOKED</span> &middot; ADMIN ARENA</span>
        <div className="nav-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={openProjector}
            style={{ borderColor: 'var(--gold)', color: 'var(--gold)', fontWeight: 700 }}
          >
            📽️ Projector Arena
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleExportCSV}
            style={{ borderColor: 'var(--green)', color: 'var(--green)', fontWeight: 700 }}
          >
            📥 Export CSV
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handlePurgeTestData}
            style={{ borderColor: 'var(--red)', color: 'var(--red)', fontWeight: 700 }}
          >
            ⚠️ Reset Test Data
          </button>
          <span className="chip">{teams.length} Teams Registered</span>
        </div>
      </nav>

      <div className="container mt-32" style={{ paddingBottom: 80 }}>
        {loadError && <p className="error-text mb-16">{loadError}</p>}

        <div className="tabs">
          <button className={`tab${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}>
            👥 Teams Roster ({teams.length})
          </button>
          <button className={`tab${tab === 'round2' ? ' active' : ''}`} onClick={() => setTab('round2')}>
            🔥 Round 2 (MCQ Fire Round)
          </button>
          <button className={`tab${tab === 'round3' ? ' active' : ''}`} onClick={() => setTab('round3')}>
            🤖 Round 3 (Human vs AI Turing)
          </button>
          <button className={`tab${tab === 'round4' ? ' active' : ''}`} onClick={() => setTab('round4')}>
            🎭 Round 4 (Tech Charades Prompter)
          </button>
          <button className={`tab${tab === 'round5' ? ' active' : ''}`} onClick={() => setTab('round5')}>
            👑 Round 5 (Grand Finale)
          </button>
        </div>

        {tab === 'teams' && <TeamsTab teams={teams} onChange={loadTeams} />}
        {tab === 'round2' && <Round2Tab teams={teams} />}
        {tab === 'round3' && <Round3Tab teams={teams} />}
        {tab === 'round4' && <Round4Tab teams={teams} />}
        {tab === 'round5' && <Round5Tab teams={teams} />}
      </div>
    </div>
  );
}

// =================== Teams Tab ===================
function TeamsTab({ teams, onChange }) {
  const [bulk, setBulk] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function addTeams() {
    const names = bulk.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!names.length) return;
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/admin/teams', { method: 'POST', body: JSON.stringify({ names }) });
      setBulk('');
      if (data.skipped?.length) {
        setError(`Skipped (already exist): ${data.skipped.join(', ')}`);
      }
      onChange();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  async function removeTeam(id) {
    if (!confirm('Remove this team? This does not clear historical scores.')) return;
    try {
      await api(`/api/admin/teams?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      onChange();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="card mb-24">
        <p className="eyebrow mb-16">Add Teams to Tournament</p>
        <div className="field">
          <label>Enter team names (one per line)</label>
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={'Byte Busters\nCyber Knights\nNull Pointers\nSyntax Errors'}
          />
        </div>
        <button className="btn btn-primary" onClick={addTeams} disabled={busy || !bulk.trim()}>
          {busy ? 'Adding Teams…' : 'Add Teams'}
        </button>
        <p className="hint-text" style={{ color: 'var(--green)', marginTop: 8 }}>
          🔑 <strong>Single Participant Password:</strong> All teams can log in using the event password <code>2026</code> with their team name.
        </p>
      </div>

      <div className="card">
        <div className="row-between mb-16">
          <p className="eyebrow" style={{ margin: 0 }}>Active Team Roster ({teams.length})</p>
          <span className="chip green">Event Password: 2026</span>
        </div>
        {teams.length === 0 ? (
          <p className="muted small">No teams registered yet. Add team names above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Team Name</th><th>Login PIN</th><th>Team ID</th><th>Action</th></tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td><span className="pin-badge">{t.pin}</span></td>
                  <td className="mono muted small">{t.id}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeTeam(t.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =================== Round 2 Tab ===================
function Round2Tab({ teams }) {
  const phase = 2;
  const [selected, setSelected] = useState({});
  const [groups, setGroups] = useState([]);
  const [board, setBoard] = useState(null);
  const [thresholdInput, setThresholdInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [error, setError] = useState('');

  const loadGroups = useCallback(async () => {
    try {
      const data = await api(`/api/admin/phase/${phase}/assign`);
      setGroups(data.groups || []);
    } catch (e) { setError(e.message); }
  }, [phase]);

  const loadBoard = useCallback(async () => {
    try {
      const data = await api(`/api/admin/phase/${phase}/leaderboard`);
      setBoard(data);
      setThresholdInput(data.threshold === null ? '' : String(data.threshold));
    } catch (e) { setError(e.message); }
  }, [phase]);

  useEffect(() => {
    setSelected({});
    loadGroups();
    loadBoard();
    const id = setInterval(loadBoard, 5000);
    return () => clearInterval(id);
  }, [phase, loadGroups, loadBoard]);

  function toggle(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectAll() {
    const all = {};
    teams.forEach((t) => { all[t.id] = true; });
    setSelected(all);
  }

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  async function runAssign() {
    setBusy(true);
    setError('');
    try {
      const data = await api(`/api/admin/phase/${phase}/assign`, {
        method: 'POST',
        body: JSON.stringify({ teamIds: selectedIds }),
      });
      setGroups(data.groups || []);
      loadBoard();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  async function saveThreshold() {
    const value = Number(thresholdInput);
    if (!Number.isFinite(value)) { setError('Enter a valid number for passing cutoff.'); return; }
    setSettingsBusy(true);
    setError('');
    try {
      const data = await api(`/api/admin/phase/${phase}/settings`, {
        method: 'POST',
        body: JSON.stringify({ threshold: value }),
      });
      setBoard((prev) => (prev ? { ...prev, threshold: data.threshold } : prev));
      loadBoard();
    } catch (e) {
      setError(e.message);
    }
    setSettingsBusy(false);
  }

  async function toggleReveal() {
    setSettingsBusy(true);
    setError('');
    try {
      const data = await api(`/api/admin/phase/${phase}/settings`, {
        method: 'POST',
        body: JSON.stringify({ revealed: !board?.revealed }),
      });
      setBoard((prev) => (prev ? { ...prev, revealed: data.revealed } : prev));
    } catch (e) {
      setError(e.message);
    }
    setSettingsBusy(false);
  }

  const stats = board?.stats;
  const hasThreshold = typeof board?.threshold === 'number';
  const rankedRows = board?.rankedRows || [];

  return (
    <div>
      {/* Quick Assign Card */}
      <div className="card mb-24">
        <div className="row-between mb-16">
          <p className="eyebrow">Round 2 &middot; Randomize &amp; Assign Balanced Sets</p>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={selectAll}>Select All</button>
            <span className="muted small">{selectedIds.length} / {teams.length} Selected</span>
          </div>
        </div>
        <div className="checkbox-grid mb-16">
          {teams.map((t) => (
            <label key={t.id} className="checkbox-row">
              <input type="checkbox" checked={!!selected[t.id]} onChange={() => toggle(t.id)} />
              {t.name}
            </label>
          ))}
        </div>
        <button className="btn btn-primary" onClick={runAssign} disabled={busy || selectedIds.length === 0}>
          {busy ? 'Assigning Sets…' : `Randomize & Assign Balanced Sets to ${selectedIds.length} Teams`}
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Threshold and Reveal Controls */}
      <div className="card mb-24">
        <p className="eyebrow mb-16">Round 2 Cutoff &amp; Results Reveal</p>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0, width: 180 }}>
            <label>Qualify if Score &ge;</label>
            <input
              type="number"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="e.g. 1500"
            />
          </div>
          <button className="btn btn-primary" onClick={saveThreshold} disabled={settingsBusy}>
            Save Cutoff
          </button>
          <button className="btn btn-ghost" onClick={toggleReveal} disabled={settingsBusy || !hasThreshold}>
            {board?.revealed ? 'Hide Results from Teams' : 'Reveal Results to Teams'}
          </button>
          {board && (
            <span className={`chip ${board.revealed ? 'green' : ''}`}>
              {board.revealed ? '📢 Results Visible to Teams' : '🔒 Results Hidden'}
            </span>
          )}
        </div>
      </div>

      {/* Round 2 Statistics Banner */}
      <div className="card mb-24">
        <p className="eyebrow mb-16">Round 2 Live Metrics</p>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="stat"><div className="n">{stats?.assigned ?? '—'}</div><div className="lbl">Assigned</div></div>
          <div className="stat"><div className="n">{stats?.submitted ?? '—'}</div><div className="lbl">Submitted</div></div>
          <div className="stat"><div className="n win">{stats?.passed ?? '—'}</div><div className="lbl">Passing</div></div>
          <div className="stat"><div className="n lose">{stats?.failed ?? '—'}</div><div className="lbl">Below Cutoff</div></div>
          <div className="stat"><div className="n">{stats?.averageScore ?? '—'}</div><div className="lbl">Avg Score</div></div>
        </div>
      </div>

      {/* Global Ranked Leaderboard Table with Tie Breaking */}
      <div className="card mb-24">
        <div className="row-between mb-16">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Round 2 Official Leaderboard (Ranked with Time Tie-Breaker)</p>
            <p className="hint-text" style={{ marginTop: 4 }}>
              Tie-breaking rule applied: When scores clash, faster time taken gets higher rank.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadBoard}>Refresh</button>
        </div>

        {rankedRows.length === 0 ? (
          <p className="muted small">No submissions yet for Round 2.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Set / Group</th>
                <th>Score</th>
                <th>Time Taken ⏱️</th>
                <th>Accuracy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rankedRows.map((row) => (
                <tr key={row.teamId}>
                  <td className="mono font-bold" style={{ color: row.globalRank === 1 ? 'var(--gold)' : 'var(--white)' }}>
                    {row.globalRank === 1 ? '🥇 #1' : row.globalRank === 2 ? '🥈 #2' : row.globalRank === 3 ? '🥉 #3' : `#${row.globalRank}`}
                  </td>
                  <td><strong>{row.teamName}</strong></td>
                  <td className="mono muted small">Set {row.setId || '—'} &middot; Grp {row.group || '—'}</td>
                  <td className="mono" style={{ fontSize: 16, color: 'var(--red)', fontWeight: 'bold' }}>
                    {row.score !== null ? `${row.score} pts` : '—'}
                  </td>
                  <td className="mono" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
                    {fmtTime(row.timeTakenSeconds)}
                  </td>
                  <td className="mono small">
                    {row.score !== null ? `${row.correct} correct / ${row.wrong} wrong` : '—'}
                  </td>
                  <td>
                    {row.score === null ? (
                      <span className="chip">Playing…</span>
                    ) : row.passed === null ? (
                      <span className="chip">Submitted</span>
                    ) : row.passed ? (
                      <span className="chip green">🏆 Qualified</span>
                    ) : (
                      <span className="chip red">🍫 Take Chocolate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =================== Round 3 Tab (Human vs AI) ===================
function Round3Tab({ teams }) {
  const [data, setData] = useState(null);
  const [thresholdInput, setThresholdInput] = useState('');
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [error, setError] = useState('');

  const loadBoard = useCallback(async () => {
    try {
      const res = await api('/api/admin/round3/leaderboard');
      setData(res);
      setThresholdInput(res.threshold === null ? '' : String(res.threshold));
    } catch (e) { setError(e.message); }
  }, []);

  useEffect(() => {
    loadBoard();
    const id = setInterval(loadBoard, 5000);
    return () => clearInterval(id);
  }, [loadBoard]);

  async function saveThreshold() {
    const value = Number(thresholdInput);
    if (!Number.isFinite(value)) { setError('Enter a valid passing score cutoff.'); return; }
    setSettingsBusy(true);
    setError('');
    try {
      await api('/api/admin/round3/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ threshold: value }),
      });
      loadBoard();
    } catch (e) { setError(e.message); }
    setSettingsBusy(false);
  }

  async function toggleReveal() {
    setSettingsBusy(true);
    setError('');
    try {
      await api('/api/admin/round3/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ revealed: !data?.revealed }),
      });
      loadBoard();
    } catch (e) { setError(e.message); }
    setSettingsBusy(false);
  }

  async function resetRound3() {
    if (!confirm('Reset all Round 3 scores?')) return;
    try {
      await api('/api/admin/round3/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ reset: true }),
      });
      loadBoard();
    } catch (e) { setError(e.message); }
  }

  const rows = data?.rows || [];
  const stats = data?.stats;

  return (
    <div>
      {/* Cutoff & Results Settings */}
      <div className="card mb-24">
        <p className="eyebrow mb-16">Round 3 Cutoff &amp; Result Controls (Human vs AI)</p>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0, width: 180 }}>
            <label>Qualify if Score &ge;</label>
            <input
              type="number"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="e.g. 1200 (12/20)"
            />
          </div>
          <button className="btn btn-primary" onClick={saveThreshold} disabled={settingsBusy}>
            Save Cutoff
          </button>
          <button className="btn btn-ghost" onClick={toggleReveal} disabled={settingsBusy}>
            {data?.revealed ? 'Hide Results from Teams' : 'Reveal Results to Teams'}
          </button>
          <button className="btn btn-ghost" onClick={resetRound3}>
            Reset Round 3 Scores
          </button>
          {data && (
            <span className={`chip ${data.revealed ? 'green' : ''}`}>
              {data.revealed ? '📢 Results Visible' : '🔒 Results Hidden'}
            </span>
          )}
        </div>
        {error && <p className="error-text mt-8">{error}</p>}
      </div>

      {/* Metrics Banner */}
      <div className="card mb-24">
        <p className="eyebrow mb-16">Round 3 Performance Metrics (20 Challenges &middot; 4-Min Limit)</p>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="stat"><div className="n">{stats?.totalTeams ?? teams.length}</div><div className="lbl">Total Teams</div></div>
          <div className="stat"><div className="n">{stats?.submitted ?? 0}</div><div className="lbl">Completed</div></div>
          <div className="stat"><div className="n win">{stats?.passed ?? 0}</div><div className="lbl">Qualified</div></div>
          <div className="stat"><div className="n lose">{stats?.failed ?? 0}</div><div className="lbl">Eliminated</div></div>
          <div className="stat"><div className="n" style={{ color: 'var(--gold)' }}>{fmtTime(stats?.fastestTime)}</div><div className="lbl">Fastest Time</div></div>
        </div>
      </div>

      {/* Official Round 3 Leaderboard */}
      <div className="card">
        <div className="row-between mb-16">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Round 3 Human vs AI Leaderboard</p>
            <p className="hint-text" style={{ marginTop: 4 }}>
              Tie-breaker: If scores clash, the team with lower time taken ranks higher.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadBoard}>Refresh</button>
        </div>

        {rows.length === 0 ? (
          <p className="muted small">No teams registered yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team Name</th>
                <th>Score</th>
                <th>Time Taken ⏱️</th>
                <th>Correct / 20</th>
                <th>Accuracy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.teamId}>
                  <td className="mono font-bold" style={{ color: row.rank === 1 ? 'var(--gold)' : 'var(--white)' }}>
                    {row.rank === 1 ? '🥇 #1' : row.rank === 2 ? '🥈 #2' : row.rank === 3 ? '🥉 #3' : `#${row.rank}`}
                  </td>
                  <td><strong>{row.teamName}</strong></td>
                  <td className="mono" style={{ fontSize: 16, color: 'var(--red)', fontWeight: 'bold' }}>
                    {row.score !== null ? `${row.score} pts` : '—'}
                  </td>
                  <td className="mono" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
                    {fmtTime(row.timeTakenSeconds)}
                  </td>
                  <td className="mono">
                    {row.score !== null ? `${row.correct} / 20` : '—'}
                  </td>
                  <td className="mono small">
                    {row.score !== null ? `${Math.round((row.correct / 20) * 100)}%` : '—'}
                  </td>
                  <td>
                    {row.score === null ? (
                      <span className="chip">Not started</span>
                    ) : row.passed ? (
                      <span className="chip green">🏆 Qualified</span>
                    ) : (
                      <span className="chip red">🍫 Take Chocolate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =================== Round 5 Tab ===================
function Round5Tab({ teams }) {
  const [data, setData] = useState(null);
  const [thresholdInput, setThresholdInput] = useState('');
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [error, setError] = useState('');
  const [suitcaseInput, setSuitcaseInput] = useState('');
  const [suitcaseMsg, setSuitcaseMsg] = useState('');

  const loadBoard = useCallback(async () => {
    try {
      const res = await api('/api/admin/round5/leaderboard');
      setData(res);
      setThresholdInput(res.threshold === null ? '' : String(res.threshold));

      // Also load current suitcase code
      const scRes = await api('/api/admin/suitcase');
      if (scRes?.code) setSuitcaseInput(scRes.code);
    } catch (e) { setError(e.message); }
  }, []);

  async function saveSuitcaseCode() {
    if (suitcaseInput.length !== 9) {
      alert('Combination must be exactly 9 digits.');
      return;
    }
    setSettingsBusy(true);
    setSuitcaseMsg('');
    try {
      const res = await api('/api/admin/suitcase', {
        method: 'POST',
        body: JSON.stringify({ code: suitcaseInput }),
      });
      setSuitcaseMsg(`✅ Combination saved: ${res.code}`);
      setTimeout(() => setSuitcaseMsg(''), 4000);
    } catch (e) {
      alert(`Failed to save: ${e.message}`);
    }
    setSettingsBusy(false);
  }

  useEffect(() => {
    loadBoard();
    const id = setInterval(loadBoard, 5000);
    return () => clearInterval(id);
  }, [loadBoard]);

  async function saveThreshold() {
    const value = Number(thresholdInput);
    if (!Number.isFinite(value)) { setError('Enter a valid passing score cutoff.'); return; }
    setSettingsBusy(true);
    setError('');
    try {
      await api('/api/admin/round5/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ threshold: value }),
      });
      loadBoard();
    } catch (e) { setError(e.message); }
    setSettingsBusy(false);
  }

  async function toggleReveal() {
    setSettingsBusy(true);
    setError('');
    try {
      await api('/api/admin/round5/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ revealed: !data?.revealed }),
      });
      loadBoard();
    } catch (e) { setError(e.message); }
    setSettingsBusy(false);
  }

  async function resetRound5() {
    if (!confirm('Reset all Round 5 scores?')) return;
    try {
      await api('/api/admin/round5/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ reset: true }),
      });
      loadBoard();
    } catch (e) { setError(e.message); }
  }

  const rows = data?.rows || [];
  const stats = data?.stats;

  return (
    <div>
      {/* 9-Digit Suitcase Lock Configuration */}
      <div className="card mb-24" style={{ border: '2px solid var(--gold)', boxShadow: '0 0 25px rgba(255,187,0,0.15)' }}>
        <p className="eyebrow mb-12" style={{ color: 'var(--gold)' }}>🔒 Grand Finale Suitcase Combination Setting</p>
        <p className="muted small mb-16" style={{ maxWidth: 680 }}>
          Set the secret 9-digit combination derived from the 3 C debugging problems. When finalist teams input this code on their screens, the server will verify and trigger the grand unlock!
        </p>
        <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            maxLength={9}
            placeholder="9 digits (e.g. 742189035)"
            value={suitcaseInput}
            onChange={(e) => setSuitcaseInput(e.target.value.replace(/\D/g, ''))}
            style={{ width: 240, fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 3, textAlign: 'center' }}
          />
          <button
            className="btn btn-primary"
            onClick={saveSuitcaseCode}
            disabled={settingsBusy || suitcaseInput.length !== 9}
          >
            Save 9-Digit Combination
          </button>
          {suitcaseMsg && <span className="mono small" style={{ color: 'var(--green)', fontWeight: 'bold' }}>{suitcaseMsg}</span>}
        </div>
      </div>

      {/* Cutoff & Results Settings */}
      <div className="card mb-24">
        <p className="eyebrow mb-16">Round 5 Cutoff &amp; Result Controls</p>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0, width: 180 }}>
            <label>Qualify if Score &ge;</label>
            <input
              type="number"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="e.g. 1200 (12/20)"
            />
          </div>
          <button className="btn btn-primary" onClick={saveThreshold} disabled={settingsBusy}>
            Save Cutoff
          </button>
          <button className="btn btn-ghost" onClick={toggleReveal} disabled={settingsBusy}>
            {data?.revealed ? 'Hide Results from Teams' : 'Reveal Results to Teams'}
          </button>
          <button className="btn btn-ghost" onClick={resetRound5}>
            Reset Round 5 Scores
          </button>
          {data && (
            <span className={`chip ${data.revealed ? 'green' : ''}`}>
              {data.revealed ? '📢 Results Visible' : '🔒 Results Hidden'}
            </span>
          )}
        </div>
        {error && <p className="error-text mt-8">{error}</p>}
      </div>

      {/* Metrics Banner */}
      <div className="card mb-24">
        <p className="eyebrow mb-16">Round 5 Performance Metrics (20 Challenges &middot; 4-Min Limit)</p>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="stat"><div className="n">{stats?.totalTeams ?? teams.length}</div><div className="lbl">Total Teams</div></div>
          <div className="stat"><div className="n">{stats?.submitted ?? 0}</div><div className="lbl">Completed</div></div>
          <div className="stat"><div className="n win">{stats?.passed ?? 0}</div><div className="lbl">Qualified</div></div>
          <div className="stat"><div className="n lose">{stats?.failed ?? 0}</div><div className="lbl">Eliminated</div></div>
          <div className="stat"><div className="n" style={{ color: 'var(--gold)' }}>{fmtTime(stats?.fastestTime)}</div><div className="lbl">Fastest Time</div></div>
        </div>
      </div>

      {/* Official Round 5 Leaderboard */}
      <div className="card">
        <div className="row-between mb-16">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Round 5 User Performance Dashboard</p>
            <p className="hint-text" style={{ marginTop: 4 }}>
              Tie-breaker: If scores clash, the team with lower time taken ranks higher.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadBoard}>Refresh</button>
        </div>

        {rows.length === 0 ? (
          <p className="muted small">No teams registered yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team Name</th>
                <th>Score</th>
                <th>Time Taken ⏱️</th>
                <th>Correct / 20</th>
                <th>Accuracy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.teamId}>
                  <td className="mono font-bold" style={{ color: row.rank === 1 ? 'var(--gold)' : 'var(--white)' }}>
                    {row.rank === 1 ? '🥇 #1' : row.rank === 2 ? '🥈 #2' : row.rank === 3 ? '🥉 #3' : `#${row.rank}`}
                  </td>
                  <td><strong>{row.teamName}</strong></td>
                  <td className="mono" style={{ fontSize: 16, color: 'var(--red)', fontWeight: 'bold' }}>
                    {row.score !== null ? `${row.score} pts` : '—'}
                  </td>
                  <td className="mono" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
                    {fmtTime(row.timeTakenSeconds)}
                  </td>
                  <td className="mono">
                    {row.score !== null ? `${row.correct} / 20` : '—'}
                  </td>
                  <td className="mono small">
                    {row.score !== null ? `${Math.round((row.correct / 20) * 100)}%` : '—'}
                  </td>
                  <td>
                    {row.score === null ? (
                      <span className="chip">Not started</span>
                    ) : row.passed ? (
                      <span className="chip green">🏆 Qualified</span>
                    ) : (
                      <span className="chip red">🍫 Take Chocolate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =================== Round 4 Tab (Tech Charades Prompter & Timer) ===================
const CHARADES_WORDS = [
  // Tech Actions & Situations
  { term: 'Merge Conflict', category: 'Tech Actions', hint: 'Two devs fighting over code' },
  { term: 'Rubber Duck Debugging', category: 'Tech Actions', hint: 'Talking earnestly to a bath toy' },
  { term: '404 Page Not Found', category: 'Tech Jargon', hint: 'Looking through binoculars, lost' },
  { term: 'Spaghetti Code', category: 'Tech Concepts', hint: 'Slurping noodles while typing fast' },
  { term: 'Infinite Loop', category: 'Tech Concepts', hint: 'Running in circles forever' },
  { term: 'DDoS Attack', category: 'Tech Actions', hint: 'Everyone swarming and crashing one person' },
  { term: 'Memory Leak', category: 'Tech Concepts', hint: 'Water dripping from brain/fingers' },
  { term: 'Crypto Mining', category: 'Tech Actions', hint: 'Digging with a pickaxe while sweating' },
  { term: 'Bluetooth Pairing Failed', category: 'Tech Blunders', hint: 'Holding hands and getting shocked apart' },
  { term: 'Turning It Off and On Again', category: 'Tech Actions', hint: 'Flipping power switch dramatically' },
  { term: 'Deadlock / Thread Lock', category: 'Tech Concepts', hint: 'Two people frozen waiting for each other' },
  { term: 'Cloud Computing', category: 'Tech Concepts', hint: 'Floating and typing in the sky' },
  { term: 'Wi-Fi Disconnected', category: 'Tech Blunders', hint: 'Frantically hunting for signals with phone' },
  { term: 'Pushing Straight to Production', category: 'Tech Blunders', hint: 'Sweating and pressing big red button' },
  { term: 'Git Pull with Uncommitted Changes', category: 'Tech Blunders', hint: 'Terrified face, explosion motion' },
  // Movies & Pop Culture
  { term: 'The Matrix (Bullet Dodge)', category: 'Tech Movies', hint: 'Leaning backward to dodge slow bullets' },
  { term: 'Silicon Valley (Tres Comas)', category: 'Tech Movies', hint: 'Billionaire doors that go like this' },
  { term: 'The Social Network (Facebook)', category: 'Tech Movies', hint: 'Typing barefoot in winter with headphones' },
  { term: 'Iron Man (Jarvis Hologram)', category: 'Tech Movies', hint: 'Swiping invisible holograms in the air' },
  { term: 'RoboCop / Terminator', category: 'Tech Movies', hint: 'Stiff robotic walk and red laser eye' },
  { term: 'Interstellar (TARS Robot)', category: 'Tech Movies', hint: 'Walking like a tall rectangular block' },
];

function Round4Tab({ teams }) {
  const [currentWord, setCurrentWord] = useState(CHARADES_WORDS[0]);
  const [revealed, setRevealed] = useState(false);
  const [selectedCat, setSelectedCat] = useState('All');
  const [time, setTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [scores, setScores] = useState({});

  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  function pickRandomWord() {
    const pool = selectedCat === 'All' 
      ? CHARADES_WORDS 
      : CHARADES_WORDS.filter((w) => w.category === selectedCat);
    const filtered = pool.filter((w) => w.term !== currentWord?.term);
    const next = filtered[Math.floor(Math.random() * (filtered.length || 1))] || pool[0];
    setCurrentWord(next);
    setRevealed(false);
    setTime(60);
    setIsRunning(false);
  }

  function adjustTeamScore(teamId, delta) {
    setScores((prev) => ({
      ...prev,
      [teamId]: Math.max(0, (prev[teamId] || 0) + delta),
    }));
  }

  const categories = ['All', 'Tech Actions', 'Tech Concepts', 'Tech Blunders', 'Tech Movies'];

  return (
    <div>
      <div className="card mb-24 text-center" style={{ padding: '32px 20px' }}>
        <p className="eyebrow mb-12">Round 4 &middot; Stage Tech Charades Prompter</p>
        
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${selectedCat === cat ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Word Display Box */}
        <div style={{
          background: '#0d0d0d',
          border: '2px solid var(--red)',
          borderRadius: 14,
          padding: '36px 20px',
          maxWidth: 640,
          margin: '0 auto 24px',
          boxShadow: '0 0 35px rgba(229,9,20,0.25)',
        }}>
          <span className="chip mb-12" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>
            Category: {currentWord?.category}
          </span>
          {revealed ? (
            <div>
              <h1 style={{ fontSize: 44, margin: '12px 0', color: 'var(--white)', letterSpacing: 1 }}>
                {currentWord?.term}
              </h1>
              <p className="muted small mono">🎭 Host Hint: {currentWord?.hint}</p>
            </div>
          ) : (
            <div>
              <h1 style={{ fontSize: 36, margin: '12px 0', color: '#555', letterSpacing: 4 }}>
                &bull; &bull; &bull; &bull; &bull; &bull; &bull;
              </h1>
              <p className="muted small">Click Reveal to show word to Actor / Audience</p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 16, padding: '12px 24px' }}
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? '🙈 Hide Word' : '👁️ Reveal Word'}
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 16, padding: '12px 24px' }}
            onClick={pickRandomWord}
          >
            🎲 Next Random Word
          </button>
        </div>
      </div>

      {/* Stage Countdown Timer & Scorekeeper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Live Stage Timer */}
        <div className="card text-center">
          <p className="eyebrow mb-12">Stage Turn Timer</p>
          <div style={{
            fontSize: 72,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: time <= 10 ? 'var(--red)' : time <= 20 ? 'var(--gold)' : 'var(--white)',
            marginBottom: 16,
          }}>
            00:{String(time).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              className={`btn ${isRunning ? 'btn-ghost' : 'btn-primary'}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? '⏸️ Pause' : '▶️ Start Timer'}
            </button>
            <button className="btn btn-ghost" onClick={() => { setIsRunning(false); setTime(60); }}>
              🔄 Reset 60s
            </button>
            <button className="btn btn-ghost" onClick={() => { setIsRunning(false); setTime(90); }}>
              90s
            </button>
          </div>
        </div>

        {/* Live Stage Score Tracker */}
        <div className="card">
          <p className="eyebrow mb-12">Round 4 Stage Point Tally</p>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Team Name</th><th>Points</th><th>Action</th></tr></thead>
              <tbody>
                {teams.slice(0, 12).map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td className="mono" style={{ fontSize: 18, color: 'var(--gold)', fontWeight: 'bold' }}>
                      {scores[t.id] || 0} pts
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => adjustTeamScore(t.id, 100)}>
                        +100
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => adjustTeamScore(t.id, -25)}>
                        -25
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

