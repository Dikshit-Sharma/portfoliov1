// Fetches public GitHub profile, repos, and contribution calendar for a user.
// Uses the GitHub GraphQL API for the contribution calendar and REST for profile/repos.
// Set GITHUB_TOKEN (optional, but recommended for higher rate limits) in Netlify env vars.
const ALLOWED_ORIGINS = ['https://dikshitsharma.netlify.app', 'https://portfoliov1.netlify.app', 'http://localhost:5173', 'http://localhost:8888'];

function getHeaders(event) {
  const origin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowOrigin = ALLOWED_ORIGINS.indexOf(origin) !== -1 ? origin : '';
  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

function ok(event, data, status) {
  return { statusCode: status || 200, headers: getHeaders(event), body: JSON.stringify(data) };
}
function err(event, status, msg) {
  return ok(event, { error: msg || 'Internal server error' }, status || 500);
}

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

async function fetchGraphQL(query, token, variables) {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'dashboard',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}

const GRAPHQL_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    name
    login
    avatarUrl
    bio
    company
    location
    websiteUrl
    repositories(privacy: PUBLIC, first: 100, orderBy: { field: PUSHED_AT, direction: DESC }) {
      nodes {
        name
        description
        url
        primaryLanguage { name color }
        stargazerCount
        forkCount
        pushedAt
        createdAt
        isFork
      }
    }
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            level
          }
        }
      }
    }
  }
}`;

const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: getHeaders(event), body: '' };
  if (event.httpMethod !== 'GET') return err(event, 405, 'Method not allowed');

  let token = process.env.GITHUB_TOKEN || '';
  let login = process.env.GITHUB_USERNAME || 'Dikshit-Sharma';

  try {
    if (!token) {
      // Fall back to unauthenticated REST API (low rate limit ~60/hr).
      const [profileRes, reposRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${login}`, { headers: { 'User-Agent': 'dashboard' } }),
        fetch(`https://api.github.com/users/${login}/repos?per_page=100&sort=updated`, { headers: { 'User-Agent': 'dashboard' } }),
        fetch(`https://api.github.com/users/${login}/events/public?per_page=100`, { headers: { 'User-Agent': 'dashboard' } }),
      ]);
      if (!profileRes.ok) return err(event, profileRes.status, 'GitHub error');
      const profile = await profileRes.json();
      const repos = reposRes.ok ? await reposRes.json() : [];
      const events = eventsRes.ok ? await eventsRes.json() : [];
      return ok(event, serializePublic(profile, repos, events));
    }

    const now = new Date();
    // Contribution graph: trailing 26 weeks (fits a week heatmap nicely).
    const from = new Date(now);
    from.setDate(from.getDate() - (26 * 7 + now.getDay()));
    const to = new Date();
    const data = await fetchGraphQL(GRAPHQL_QUERY, token, {
      login,
      from: from.toISOString(),
      to: to.toISOString(),
    });
    const user = data.user;
    return ok(event, serialize(user, now));
  } catch {
    return err(event, 500, 'GitHub data is temporarily unavailable');
  }
};

function serialize(user, now) {
  const repos = (user.repositories?.nodes || []).filter((r) => !r.isFork).map((r) => ({
    name: r.name,
    description: r.description,
    url: r.url,
    language: r.primaryLanguage?.name || 'Unknown',
    languageColor: r.primaryLanguage?.color || '#8b949e',
    stars: r.stargazerCount,
    forks: r.forkCount,
    pushedAt: r.pushedAt,
    createdAt: r.createdAt,
  }));
  const calendar = user.contributionsCollection?.contributionCalendar;
  const weeks = (calendar?.weeks || []).map((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: d.level })),
  );
  const days = weeks.flat();
  return {
    profile: {
      name: user.name,
      login: user.login,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      company: user.company,
      location: user.location,
      websiteUrl: user.websiteUrl,
    },
    repos,
    contributions: {
      total: calendar?.totalContributions || 0,
      weeks,
      days,
    },
    asOf: now.toISOString(),
  };
}

function serializePublic(profile, repos, events) {
  // Build a lightweight contribution timeline from public push events.
  const byDate = {};
  events.forEach((ev) => {
    const date = (ev.created_at || '').slice(0, 10);
    if (!date) return;
    byDate[date] = (byDate[date] || 0) + 1;
  });
  return {
    profile: {
      name: profile.name,
      login: profile.login,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      company: profile.company,
      location: profile.location,
      websiteUrl: profile.blog,
    },
    repos: (repos || []).map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language || 'Unknown',
      languageColor: '#8b949e',
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushedAt: r.pushed_at,
      createdAt: r.created_at,
    })),
    contributions: { total: Object.values(byDate).reduce((a, b) => a + b, 0), weeks: [], days: [] },
    asOf: new Date().toISOString(),
    note: 'Aggregate public activity shown; detailed contribution calendar unavailable in this mode.',
  };
}

module.exports = { handler };
