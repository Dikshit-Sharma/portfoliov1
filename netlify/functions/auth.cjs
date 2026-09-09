// Password verification for protected sections (journal & AMLI_Vault).
// Set DASHBOARD_PASSWORD in Netlify environment variables / netlify.toml.
const crypto = require('crypto');

const ALLOWED_ORIGINS = ['https://dikshitsharma.netlify.app', 'https://portfoliov1.netlify.app', 'http://localhost:5173', 'http://localhost:8888'];

// Simple in-memory rate limiter. Serverless instances are per-warm-container,
// so this is best-effort (not a global limiter) but adds real friction to
// brute-force attempts without external dependencies.
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_BODY_BYTES = 2048;
const attempts = new Map(); // clientKey -> { count, windowStart }

function getHeaders(event) {
  const origin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowOrigin = ALLOWED_ORIGINS.indexOf(origin) !== -1 ? origin : '';
  return {
    // Only set ACAO for allowlisted origins; omit it otherwise so browsers
    // block the read without leaking allowlist state.
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function ok(event, data, status) {
  return { statusCode: status || 200, headers: getHeaders(event), body: JSON.stringify(data) };
}
function err(event, status, msg) {
  return ok(event, { error: msg || 'Internal server error' }, status || 500);
}

function clientKey(event) {
  const headers = (event && event.headers) || {};
  // Prefer the non-spoofable Netlify connection IP. The last hop of
  // x-forwarded-for is appended by the edge (real client IP); the first element
  // is attacker-controllable, so we must not trust it.
  const nfIp = headers['x-nf-client-connection-ip'] || '';
  if (nfIp) return `ip:${nfIp}`;
  const forwarded = headers['x-forwarded-for'] || '';
  if (forwarded) {
    const parts = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return `ip:${last}`;
  }
  // No forwarding headers: group by a hash of the URL path only so that
  // header-less clients still share a rate-limit bucket without a global
  // single-point lockout across unrelated requests.
  return `url:${(event.path || event.rawUrl || 'unknown').split('?')[0]}`;
}

function isBlocked(key) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.windowStart > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILS;
}

function recordFailure(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

// Constant-time comparison to avoid leaking password equality timing.
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: getHeaders(event), body: '' };
  if (event.httpMethod !== 'POST') return err(event, 405, 'Method not allowed');

  const bodySize = Buffer.byteLength(event.body || '', 'utf8');
  if (bodySize > MAX_BODY_BYTES) return err(event, 413, 'Payload too large');

  const password = process.env.DASHBOARD_PASSWORD || '';
  if (!password) return err(event, 500, 'Authentication is not configured');

  const key = clientKey(event);
  if (isBlocked(key)) return err(event, 429, 'Too many attempts. Try again later.');

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return err(event, 400, 'Invalid JSON'); }
  if (typeof body.password !== 'string' || body.password.length === 0) return err(event, 400, 'password is required');

  const valid = safeEqual(body.password, password);
  if (!valid) {
    recordFailure(key);
  }
  return ok(event, { valid });
};

module.exports = { handler };