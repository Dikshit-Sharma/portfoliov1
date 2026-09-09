// Serves the AMLI_Vault snapshot for the dashboard.
//
// Data flow:
//   - a scheduled Netlify function (amli-sync) refreshes the snapshot every morning at
//     05:30 UTC and persists it to Netlify Blobs.
//   - GET /api/amli            → fresh snapshot if available, otherwise live fetch.
//   - GET /api/amli?sync=1     → force an on-demand refresh through amli-sync, then serve.
//
// Privacy model: aggregate stats (totals, counts, graphs) are public, matching the
// dashboard's "company details are password protected" UI. The protected detail
// fields (`topApis`, `recent`) and the on-demand refresh path are only returned /
// executed when the caller presents a valid dashboard auth header (see getAuthToken).
const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');
const { fetchStats } = require('./amli-sync.cjs');

const STORE = 'amli-dashboard';
const SNAPSHOT_KEY = 'snapshot-v1';
const FRESH_MS = 26 * 60 * 60 * 1000;

const ALLOWED_ORIGINS = ['https://dikshitsharma.netlify.app', 'https://portfoliov1.netlify.app', 'http://localhost:5173', 'http://localhost:8888'];

// Fields that are only served with a valid dashboard auth token.
const PROTECTED_FIELDS = ['topApis', 'recent'];

function getHeaders(event) {
  const origin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowOrigin = ALLOWED_ORIGINS.indexOf(origin) !== -1 ? origin : '';
  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Dashboard-Auth',
    'Content-Type': 'application/json',
  };
}
function ok(event, data, status) {
  return { statusCode: status || 200, headers: getHeaders(event), body: JSON.stringify(data) };
}
function err(event, status, msg) {
  return ok(event, { error: msg || 'Internal server error' }, status || 500);
}

// Compare an incoming X-Dashboard-Auth token against sha256(DASHBOARD_PASSWORD).
// The client stores the sha256 of the validated password in sessionStorage after a
// successful /api/auth unlock, so the password itself is never sent to this endpoint.
function hasValidAuth(event) {
  const password = process.env.DASHBOARD_PASSWORD || '';
  if (!password) return false;
  const token = (event.headers && (event.headers['x-dashboard-auth'] || '')) || '';
  if (!token) return false;
  const expected = crypto.createHash('sha256').update(password).digest('hex');
  const a = Buffer.from(String(token).toLowerCase());
  const b = Buffer.from(expected.toLowerCase());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function publicSnapshot(snapshot, authed) {
  // Never leak protected fields unless the caller is authenticated.
  const out = { ...snapshot };
  for (const field of PROTECTED_FIELDS) {
    if (!authed) delete out[field];
  }
  if (authed) out.detailsUnlocked = true;
  return out;
}

async function readSnapshot() {
  try {
    const store = getStore(STORE);
    const snapshot = await store.getJSON(SNAPSHOT_KEY);
    if (!snapshot || !snapshot.sampledAt) return null;
    const age = Date.now() - new Date(snapshot.sampledAt).getTime();
    if (age > FRESH_MS) return null;
    return snapshot;
  } catch {
    return null;
  }
}

async function writeSnapshot(snapshot) {
  try {
    const store = getStore(STORE);
    await store.setJSON(SNAPSHOT_KEY, snapshot);
  } catch { /* best effort */ }
}

const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: getHeaders(event), body: '' };
  if (event.httpMethod !== 'GET') return err(event, 405, 'Method not allowed');

  const authed = hasValidAuth(event);

  try {
    // On-demand refresh path is privileged: refuse without a valid auth token.
    if (event.queryStringParameters && event.queryStringParameters.sync === '1') {
      if (!authed) return err(event, 403, 'A dashboard auth token is required to refresh AMLI data');
      const stats = await fetchStats();
      await writeSnapshot(stats);
      return ok(event, publicSnapshot(stats, true));
    }

    // Prefer the daily snapshot; fall back to a live fetch.
    const snapshot = await readSnapshot();
    if (snapshot) return ok(event, { ...publicSnapshot(snapshot, authed), fromCache: true });

    const stats = await fetchStats();
    await writeSnapshot(stats);
    return ok(event, publicSnapshot(stats, authed));
  } catch {
    return err(event, 500, 'Failed to fetch AMLI data');
  }
};

module.exports = { handler };