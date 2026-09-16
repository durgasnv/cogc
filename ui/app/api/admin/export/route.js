import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';
import teamsDetailed from '@/lib/data/teams-detailed.json';

export async function GET(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const store = kv();
  const teamIds = await store.smembers('teams:index');

  // Build CSV headers
  const headers = [
    'Team Name',
    'Department',
    'Year',
    'Member 1',
    'Roll 1',
    'Contact 1',
    'Member 2',
    'Roll 2',
    'Contact 2',
    'Round 2 Score',
    'Round 2 Status',
    'Round 3 Score',
    'Round 3 Status',
    'Round 5 Status',
  ];

  const csvRows = [headers.join(',')];

  // Map details for fast lookup
  const detailsMap = {};
  (teamsDetailed || []).forEach((t) => {
    detailsMap[t.name.toLowerCase()] = t;
  });

  for (const id of teamIds || []) {
    const team = await store.get(`team:${id}`);
    if (!team) continue;

    const teamName = team.name || id;
    const meta = detailsMap[teamName.toLowerCase()] || {};

    const m1 = meta.members?.[0] || {};
    const m2 = meta.members?.[1] || {};

    const r2Score = await store.get(`phase:2:score:${id}`);
    const r2Status = r2Score ? (r2Score.passed ? 'QUALIFIED' : 'ELIMINATED') : 'NOT_ATTEMPTED';

    const r3Score = await store.get(`round3:score:${id}`);
    const r3Status = r3Score ? (r3Score.passed ? 'QUALIFIED' : 'ELIMINATED') : 'NOT_ATTEMPTED';

    const r5Score = await store.get(`round5:score:${id}`);
    const r5Status = r5Score ? 'COMPLETED' : 'NOT_ATTEMPTED';

    const row = [
      `"${teamName.replace(/"/g, '""')}"`,
      `"${(meta.department || '').replace(/"/g, '""')}"`,
      `"${(meta.year || '').replace(/"/g, '""')}"`,
      `"${(m1.name || '').replace(/"/g, '""')}"`,
      `"${(m1.roll || '').replace(/"/g, '""')}"`,
      `"${(m1.phone || '').replace(/"/g, '""')}"`,
      `"${(m2.name || '').replace(/"/g, '""')}"`,
      `"${(m2.roll || '').replace(/"/g, '""')}"`,
      `"${(m2.phone || '').replace(/"/g, '""')}"`,
      r2Score?.score !== undefined ? r2Score.score : '',
      r2Status,
      r3Score?.score !== undefined ? r3Score.score : '',
      r3Status,
      r5Status,
    ];

    csvRows.push(row.join(','));
  }

  const csvContent = csvRows.join('\r\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="engineering_day_results_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
