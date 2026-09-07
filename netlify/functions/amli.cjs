// Serves the AMLI_Vault snapshot for the dashboard.
//
// Data flow:
//   - a scheduled Netlify function (amli-sync) refreshes the snapshot every morning at
//     05:30 UTC and persists it to Netlify Blobs.
//   - GET /api/amli            → fresh snapshot if available, otherwise live fetch.
//   - GET /api/amli?sync=1     → force an on-demand refresh through amli-sync, then serve.
const { getStore } = require('@netlify/blobs');
const { fetchStats } = require('./amli-sync.cjs');

const STORE = 'amli-dashboard';
const SNAPSHOT_KEY = 'snapshot-v1';
const FRESH_MS = 26 * 60 * 60 * 1000;

const ALLOWED_ORIGINS = ['https://dikshitsharma.netlify.app', 'https://portfoliov1.netlify.app', 'http://localhost:5173', 'http://localhost:8888'];

function getHeaders(event) {
  const origin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.indexOf(origin) !== -1 ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  try {
    // On-demand refresh path.
    if (event.queryStringParameters && event.queryStringParameters.sync === '1') {
      const stats = await fetchStats();
      await writeSnapshot(stats);
      return ok(event, stats);
    }

    // Prefer the daily snapshot; fall back to a live fetch.
    const snapshot = await readSnapshot();
    if (snapshot) return ok(event, { ...snapshot, fromCache: true });

    const stats = await fetchStats();
    await writeSnapshot(stats);
    return ok(event, stats);
  } catch (e) {
    return err(event, 500, e.message || 'Failed to fetch AMLI data');
  }
};

module.exports = { handler };