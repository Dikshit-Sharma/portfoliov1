export interface Project {
  id: string
  name: string
  kicker: string
  description: string
  longDescription?: string
  problem?: string
  solution?: string
  architecture?: string
  technologies: string[]
  status: 'production' | 'building' | 'experiment' | 'stable' | 'archived'
  links: {
    live?: string
    source?: string
    demo?: string
  }
  capabilities: string[]
  category: 'professional' | 'personal' | 'internship'
  featured: boolean
  deepDive?: {
    architecture?: string
    apis?: string
    database?: string
    auth?: string
    caching?: string
    errorHandling?: string
    monitoring?: string
    deployment?: string
    tradeoffs?: string
    lessonsLearned?: string
  }
}

export const projects: Project[] = [
  {
    id: 'amli-tools',
    name: 'AMLI Tools',
    kicker: 'Personal Project · Developer Productivity Platform',
    description: 'A full-stack internal-tools-style platform to consolidate repetitive engineering workflows around AES encryption/decryption, API documentation, API artifacts, credential management, BSA tracking, GitLab analytics, and reporting.',
    longDescription: 'AMLI Tools was created as a personal project while working on the Axis Max Life Insurance project. It combines a web application with a Microsoft Edge extension (RepoScope) to make repetitive workflows faster and more organized.',
    problem: 'Engineering teams working with APIs and sensitive data often have information distributed across Jira, Confluence, Git repositories, spreadsheets, local files, chat, and environment-specific configuration.',
    solution: 'Centralized platform with AES encryption toolkit, API artifacts manager, credentials vault, BSA tracker, GitLab analytics, and reporting — all accessible via web app and Edge extension.',
    architecture: 'React 19 frontend with Firebase Firestore for data, Netlify Functions for serverless API, Firebase Cloud Functions for background jobs, GitLab API integration, Groq AI proxy, SendGrid for emails, Three.js for 3D visualizations.',
    technologies: [
      'React 19',
      'Firebase Firestore',
      'Netlify Functions',
      'Firebase Cloud Functions',
      'GitLab API',
      'Groq API (LLaMA 3.3 70B)',
      'SendGrid',
      'Three.js',
      'Web Crypto API',
    ],
    status: 'building',
    links: {
      live: 'https://amliaes.netlify.app',
      source: 'https://github.com/Dikshit-Sharma/amli-tools',
    },
    capabilities: [
      'AES-256 encryption/decryption (GCM/CBC)',
      'API artifact management',
      'Credential vault with masking',
      'BSA tracking & reporting',
      'GitLab analytics (RepoScope)',
      'Edge extension for GitLab',
      'AI-assisted analysis via Groq',
    ],
    category: 'personal',
    featured: true,
    deepDive: {
      architecture: 'Client-heavy React app with serverless functions. Firebase provides real-time sync and auth. Netlify Functions handle GitLab API proxying, Groq AI calls, and SendGrid emails to keep secrets server-side.',
      apis: 'RESTful endpoints for artifacts, credentials, BSA. GitLab API proxied through Netlify Functions with CORS/SSRF protection. Groq API called server-side for AI features.',
      database: 'Firebase Firestore for document storage (artifacts, credentials, BSA entries, GitLab data). Real-time listeners for collaborative features.',
      auth: 'Firebase Authentication with email/password. Client-side AES encryption keys derived from user password via PBKDF2.',
      caching: 'Client-side caching via React state and localStorage for offline reads. Firestore persistence enabled.',
      errorHandling: 'Sentry for error tracking and session replay. Boundary components for graceful degradation. Toast notifications for user-facing errors.',
      monitoring: 'Firebase Analytics for usage. Sentry for errors. Custom logging for API calls.',
      deployment: 'Netlify for frontend and functions. Firebase for backend services. Edge extension published to Microsoft Edge Add-ons.',
      tradeoffs: 'Chose Firebase over traditional backend for rapid iteration and real-time sync. Tradeoff: vendor lock-in and query limitations. Chose client-side encryption for zero-knowledge security. Tradeoff: key management complexity.',
      lessonsLearned: 'Serverless functions excel at secret management. Client-side crypto requires careful key derivation. Extension development has stricter CSP requirements. Three.js adds bundle size but enables unique visualizations.',
    },
  },
  {
    id: 'axis-max-life',
    name: 'Axis Max Life Insurance',
    kicker: 'Professional Work · Cognizant',
    description: 'Developed and maintained microservices-based insurance applications for policy management, customer onboarding, and claim-processing workflows.',
    longDescription: 'Core backend services for a major insurance platform handling policy lifecycle, customer data, and claims. Built with Java, Spring Boot, Spring Cloud on AWS.',
    technologies: [
      'Java',
      'Spring Boot',
      'Spring Cloud',
      'Microservices',
      'AWS Lambda',
      'API Gateway',
      'SQS',
      'SNS',
      'DynamoDB',
      'RDS',
      'AWS Batch',
    ],
    status: 'production',
    links: {},
    capabilities: [
      'Microservices architecture',
      'REST API design',
      'AWS cloud integration',
      'Event-driven communication',
      'Policy workflows',
      'Customer onboarding',
      'Claim processing',
    ],
    category: 'professional',
    featured: true,
    deepDive: {
      architecture: 'Spring Boot microservices deployed on AWS ECS/Fargate. API Gateway for routing. SQS/SNS for async communication. DynamoDB for high-throughput reads, RDS for transactional data.',
      apis: 'REST APIs with OpenAPI specs. JWT-based auth via Spring Security. Rate limiting at API Gateway.',
      database: 'RDS (PostgreSQL) for ACID transactions. DynamoDB for high-volume policy reads. AWS Batch for bulk processing.',
      auth: 'OAuth2/OIDC with Spring Security. Role-based access control.',
      caching: 'Redis (ElastiCache) for session and reference data.',
      errorHandling: 'Centralized exception handling. Dead letter queues for failed async messages. Retry with exponential backoff.',
      monitoring: 'CloudWatch metrics/alarms. X-Ray distributed tracing. Custom business metrics.',
      deployment: 'CI/CD via GitLab CI. Blue-green deployments via ECS. Infrastructure as Code with CloudFormation.',
      tradeoffs: 'Microservices add operational complexity. Chose event-driven for decoupling but added eventual consistency challenges. DynamoDB vs RDS tradeoff for access patterns.',
      lessonsLearned: 'Invest in observability early. Contract testing prevents integration failures. Database per service is essential. Async communication needs idempotency.',
    },
  },
  {
    id: 'travel-booking',
    name: 'Travel Booking System',
    kicker: 'Internship Project · Team',
    description: 'Team internship project: a responsive booking experience with login, registration, travel booking, and MySQL-backed data management.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'MySQL', 'GitHub'],
    status: 'archived',
    links: {},
    capabilities: ['Auth flows', 'Booking workflows', 'Responsive UI', 'Collaboration'],
    category: 'internship',
    featured: false,
  },
]

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured)
}

export function getProjectsByCategory(category: Project['category']): Project[] {
  return projects.filter((p) => p.category === category)
}