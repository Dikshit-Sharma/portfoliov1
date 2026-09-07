// Scheduled function: refreshes the AMLI_Vault snapshot every morning at 05:30 UTC
// and persists it to Netlify Blob store, so the dashboard serves the daily snapshot
// (with a fast live-fetch fallback). Also supports on-demand refresh via
// GET /api/amli-sync?force=1 (called by the "Update now" button / ?sync=1).
const { getStore } = require('@netlify/blobs');

const baseURLs = {
  artifacts: process.env.AMLI_ARTIFACTS_URL || 'https://amliaes.netlify.app/api/artifacts',
  bsa: process.env.AMLI_BSA_URL || 'https://amliaes.netlify.app/api/bsa',
};

const STORE = 'amli-dashboard';
const SNAPSHOT_KEY = 'snapshot-v1';
const FRESH_MS = 26 * 60 * 60 * 1000; // 26h — mornings are 24h apart

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
  } catch (e) { stats.error = e.message; }
  try {
    const res = await fetch(baseURLs.bsa, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      stats.bsaCount = (Array.isArray(data) ? data : data.entries || []).length;
    }
  } catch (e) { stats.bsaError = e.message; }
  try {
    const res = await fetch(`${baseURLs.artifacts}?extract-credentials=1`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      stats.credCountTotal = Object.values(data.credentials || {}).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
    }
  } catch (e) { stats.credError = e.message; }
  stats.sampledAt = new Date().toISOString();
  return stats;
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
    return true;
  } catch {
    return false;
  }
}

const handler = async (event) => {
  const isScheduled = !event.httpMethod || event.httpMethod === 'POST' && !event.queryStringParameters;
  const force = event.httpMethod === 'GET' && event.queryStringParameters && event.queryStringParameters.force === '1';

  // Scheduled trigger or forced refresh → regenerate + persist.
  if (isScheduled || force) {
    try {
      const stats = await fetchStats();
      await writeSnapshot(stats);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, refreshedAt: stats.sampledAt, total: stats.total }),
      };
    } catch (e) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
    }
  }

  // Serving path (used by amli.cjs through /api/amli-sync): return the cached snapshot.
  const snapshot = await readSnapshot();
  if (snapshot) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(snapshot) };
  }
  return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false }) };
};

module.exports = { handler, fetchStats };