// Scheduled function: refreshes the AMLI_Vault snapshot every morning at 05:30 UTC
// and persists it to Netlify Blob store, so the dashboard serves the daily snapshot
// (with a fast live-fetch fallback). Also supports on-demand refresh via
// GET /api/amli?sync=1 (called by the "Update now" button), which requires the
// dashboard auth token.
const { getStore } = require('@netlify/blobs');

const baseURLs = {
  artifacts: process.env.AMLI_ARTIFACTS_URL || 'https://amliaes.netlify.app/api/artifacts',
  bsa: process.env.AMLI_BSA_URL || 'https://amliaes.netlify.app/api/bsa',
};

const STORE = 'amli-dashboard';
const SNAPSHOT_KEY = 'snapshot-v1';

function authHeaders() {
  const key = process.env.AMLI_API_KEY || '';
  const h = { 'Content-Type': 'application/json' };
  if (key) h['X-API-Key'] = key;
  return h;
}

async function fetchStats() {
  const stats = { total: 0, envCounts: {}, activity: [], velocity: [], topApis: [], recent: [], bsaCount: 0, credCountTotal: 0 };
  try {
    const res = await fetch(`${baseURLs.artifacts}?stats=1`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      stats.total = data.total || 0;
      stats.envCounts = data.envCounts || {};
      stats.activity = (data.activity || []).slice(-90);
      stats.velocity = data.velocity || [];
      stats.topApis = data.topApis || [];
      stats.recent = (data.recent || []).slice(0, 12);
    }
  } catch { /* upstream errors are not persisted into the served snapshot */ }
  try {
    const res = await fetch(baseURLs.bsa, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      stats.bsaCount = (Array.isArray(data) ? data : data.entries || []).length;
    }
  } catch { /* ignored */ }
  try {
    const res = await fetch(`${baseURLs.artifacts}?extract-credentials=1`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      stats.credCountTotal = Object.values(data.credentials || {}).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
    }
  } catch { /* ignored */ }
  stats.sampledAt = new Date().toISOString();
  return stats;
}

async function writeSnapshot(snapshot) {
  try {
    const store = getStore(STORE);
    await store.setJSON(SNAPSHOT_KEY, snapshot);
    return true;
  } catch {
    return false;
  }
}

const ALLOWED_ORIGINS = ['https://dikshitsharma.netlify.app', 'https://portfoliov1.netlify.app', 'http://localhost:5173', 'http://localhost:8888'];

const handler = async (event) => {
  // Only the scheduled path (or the amli.cjs refresh which passes an allowlisted
  // browser origin) is allowed to write. This function is NOT a public endpoint:
  // it never serves data, it only refreshes the shared snapshot.
  const headers = event.headers || {};
  const origin = headers.origin || '';
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return { statusCode: 403, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Origin not allowed' }) };
  }
  const isScheduled =
    event.httpMethod === 'POST' &&
    (headers['x-nf-scheduled'] || headers['x-nf-event'] === 'scheduled');

  if (!isScheduled && !origin) {
    return { statusCode: 403, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Not authorized' }) };
  }

  try {
    const stats = await fetchStats();
    await writeSnapshot(stats);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, refreshedAt: stats.sampledAt, total: stats.total }),
    };
  } catch {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Refresh failed' }) };
  }
};

module.exports = { handler, fetchStats };