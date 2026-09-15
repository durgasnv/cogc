import crypto from 'crypto';

function getSecret() {
  return process.env.SESSION_SECRET || 'dev-secret-engineers-day-super-key-2024';
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function fromBase64url(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function hmac(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

/** Sign a JSON-serializable payload into a compact, tamper-evident token. */
export function signSession(payload) {
  const body = base64url(JSON.stringify(payload));
  const sig = hmac(body);
  return `${body}.${sig}`;
}

/** Verify a token produced by signSession(). Returns the payload or null. */
export function verifySession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = hmac(body);
  // constant-time compare
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(fromBase64url(body));
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE = 'cogc_admin';
export const TEAM_COOKIE = 'cogc_team';

export function checkAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || 'admin123';
  return password === expected;
}

export function checkParticipantPassword(password, teamPin = null) {
  const universal = process.env.PARTICIPANT_PASSWORD || '2026';
  if (password === universal) return true;
  if (teamPin && password === teamPin) return true;
  return false;
}

/** Universal single password/PIN for all participants. */
export function generatePin() {
  return process.env.PARTICIPANT_PASSWORD || '2026';
}

export function slugifyTeamId(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'team';
}

/** Returns true if the incoming request carries a valid admin session cookie. */
export function isAdminRequest(req) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const payload = verifySession(token);
  return !!(payload && payload.role === 'admin');
}

/** Returns the team session payload ({ id, name }) or null. */
export function getTeamFromRequest(req) {
  const token = req.cookies.get(TEAM_COOKIE)?.value;
  const payload = verifySession(token);
  if (!payload || payload.role !== 'team') return null;
  return payload;
}
