import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdminRequest } from '@/lib/auth';

export async function GET(req, { params }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const phase = Number(params.phase);
  const store = kv();
  const threshold = await store.get(`phase:${phase}:threshold`);
  const revealed = !!(await store.get(`phase:${phase}:revealed`));
  return NextResponse.json({ phase, threshold: threshold ?? null, revealed });
}

export async function POST(req, { params }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const phase = Number(params.phase);
  if (![1, 2, 3].includes(phase)) return NextResponse.json({ error: 'Invalid phase.' }, { status: 400 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const store = kv();

  if (typeof body?.threshold === 'number' && Number.isFinite(body.threshold)) {
    await store.set(`phase:${phase}:threshold`, body.threshold);
  }
  if (typeof body?.revealed === 'boolean') {
    await store.set(`phase:${phase}:revealed`, body.revealed);
  }

  const threshold = await store.get(`phase:${phase}:threshold`);
  const revealed = !!(await store.get(`phase:${phase}:revealed`));
  return NextResponse.json({ phase, threshold: threshold ?? null, revealed });
}
