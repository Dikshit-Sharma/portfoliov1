/**
 * Architecture model — a data-driven system map of the workspace's components
 * and their connections. Nodes and edges describe how this workspace and the
 * real projects behind it are wired together. Content is strictly derived from
 * documented project/experience facts — nothing is invented.
 */

export type ArchitectureNodeType =
  | 'client'
  | 'gateway'
  | 'frontend'
  | 'backend'
  | 'service'
  | 'data'
  | 'integration'
  | 'storage'
  | 'platform'

export interface ArchitectureNode {
  id: string
  label: string
  type: ArchitectureNodeType
  technology: string
  responsibility: string
  projectId?: string
}

export interface ArchitectureEdge {
  source: string
  target: string
  label?: string
}

export interface SystemMap {
  id: string
  name: string
  description: string
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
}

export const systemMaps: SystemMap[] = [
  {
    id: 'portfolio-os',
    name: 'Portfolio OS',
    description: 'This workspace — a React SPA over Netlify Functions, static knowledge data, and client-side encryption.',
    nodes: [
      { id: 'browser', label: 'Browser', type: 'client', technology: 'React 19 / Vite', responsibility: 'Workspace shell, workspaces, command palette, terminal' },
      { id: 'edge', label: 'Netlify Edge', type: 'gateway', technology: 'Netlify', responsibility: 'Static assets, SPA redirects, /api/* routing' },
      { id: 'spa', label: 'SPA', type: 'frontend', technology: 'React + TypeScript', responsibility: 'Portfolio OS interface' },
      { id: 'functions', label: 'Functions', type: 'backend', technology: 'Netlify Functions (CJS)', responsibility: 'Auth, GitHub proxy, AMLI snapshot, novel sync' },
      { id: 'gh', label: 'GitHub API', type: 'integration', technology: 'REST / GraphQL', responsibility: 'Profile, repos, contribution calendar' },
      { id: 'obsidian', label: 'Obsidian', type: 'storage', technology: 'Static JSON + generator', responsibility: 'Public knowledge notes (public: true only)' },
      { id: 'blobs', label: 'Netlify Blobs', type: 'storage', technology: '@netlify/blobs', responsibility: 'Cached AMLI / novel snapshots' },
      { id: 'amli', label: 'AMLI service', type: 'integration', technology: 'amliaes.netlify.app', responsibility: 'Artifacts, BSA, credential stats' },
      { id: 'local', label: 'Journal (local)', type: 'storage', technology: 'localStorage + AES-256-GCM', responsibility: 'Private encrypted journal entries' },
    ],
    edges: [
      { source: 'browser', target: 'spa' },
      { source: 'spa', target: 'edge' },
      { source: 'edge', target: 'functions' },
      { source: 'functions', target: 'gh' },
      { source: 'functions', target: 'obsidian' },
      { source: 'functions', target: 'amli' },
      { source: 'functions', target: 'blobs' },
      { source: 'spa', target: 'local' },
    ],
  },
  {
    id: 'amli-tools',
    name: 'AMLI Tools',
    description: 'Developer productivity platform — web app plus an Edge extension consolidating encryption, artifacts, credentials, BSA and GitLab analytics.',
    nodes: [
      { id: 'web', label: 'Web App', type: 'frontend', technology: 'React 19 / Vite', responsibility: 'Enc/dec, artifacts, credentials, reports' },
      { id: 'ext', label: 'RepoScope Extension', type: 'client', technology: 'TypeScript / Edge Add-ons', responsibility: 'In-browser GitLab analytics and 3D graph' },
      { id: 'nfn', label: 'Netlify Functions', type: 'backend', technology: 'Netlify', responsibility: 'GitLab proxy, Groq AI, SendGrid, secrets server-side' },
      { id: 'fcm', label: 'Cloud Functions', type: 'backend', technology: 'Firebase Cloud Functions', responsibility: 'Background jobs' },
      { id: 'firestore', label: 'Firestore', type: 'data', technology: 'Firebase Firestore', responsibility: 'Artifacts, credentials, BSA, GitLab data' },
      { id: 'auth', label: 'Firebase Auth', type: 'integration', technology: 'Firebase Authentication', responsibility: 'Email/password auth, client crypto keys via PBKDF2' },
      { id: 'gitlab', label: 'GitLab API', type: 'integration', technology: 'REST', responsibility: 'Project/contribution/CI data' },
      { id: 'groq', label: 'Groq API', type: 'integration', technology: 'LLaMA 3.3 70B', responsibility: 'AI-assisted analysis' },
    ],
    edges: [
      { source: 'web', target: 'nfn' },
      { source: 'ext', target: 'gitlab' },
      { source: 'nfn', target: 'gitlab' },
      { source: 'nfn', target: 'groq' },
      { source: 'web', target: 'firestore' },
      { source: 'web', target: 'auth' },
      { source: 'fcm', target: 'firestore' },
    ],
  },
  {
    id: 'axis-max-life',
    name: 'Axis Max Life Insurance',
    description: 'Production microservices on AWS for policy, onboarding and claim workflows — the professional system at Cognizant.',
    nodes: [
      { id: 'clients', label: 'Clients', type: 'client', technology: 'Web / Partner apps', responsibility: 'Policy, onboarding, claims entry' },
      { id: 'apigw', label: 'API Gateway', type: 'gateway', technology: 'AWS API Gateway', responsibility: 'Routing, rate limiting, JWT auth' },
      { id: 'svc', label: 'Microservices', type: 'service', technology: 'Java / Spring Boot / Spring Cloud', responsibility: 'Policy lifecycle, customer, claims' },
      { id: 'sqssns', label: 'Event Bus', type: 'integration', technology: 'SQS / SNS', responsibility: 'Async decoupling of workflows' },
      { id: 'dynamo', label: 'DynamoDB', type: 'data', technology: 'AWS DynamoDB', responsibility: 'High-throughput policy reads' },
      { id: 'rds', label: 'RDS', type: 'data', technology: 'AWS RDS (PostgreSQL)', responsibility: 'Transactional / ACID data' },
      { id: 'batch', label: 'Batch', type: 'backend', technology: 'AWS Batch', responsibility: 'Bulk processing' },
      { id: 'cache', label: 'ElastiCache', type: 'storage', technology: 'Redis', responsibility: 'Sessions and reference data' },
    ],
    edges: [
      { source: 'clients', target: 'apigw' },
      { source: 'apigw', target: 'svc' },
      { source: 'svc', target: 'sqssns' },
      { source: 'svc', target: 'dynamo' },
      { source: 'svc', target: 'rds' },
      { source: 'svc', target: 'cache' },
      { source: 'svc', target: 'batch' },
    ],
  },
]

export function getSystemMap(id: string): SystemMap | undefined {
  return systemMaps.find((m) => m.id === id)
}

export const NODE_TONE: Record<ArchitectureNodeType, string> = {
  client: 'text-sky-400 border-sky-400/30',
  gateway: 'text-amber-400 border-amber-400/30',
  frontend: 'text-indigo-400 border-indigo-400/30',
  backend: 'text-violet-400 border-violet-400/30',
  service: 'text-emerald-400 border-emerald-400/30',
  data: 'text-rose-400 border-rose-400/30',
  integration: 'text-cyan-400 border-cyan-400/30',
  storage: 'text-zinc-400 border-zinc-400/30',
  platform: 'text-fuchsia-400 border-fuchsia-400/30',
}