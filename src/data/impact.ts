export interface ImpactMetric {
  id: string
  label: string
  value: string
  context: string
  source: string
}

export const impactMetrics: ImpactMetric[] = [
  {
    id: 'api-performance',
    label: 'API Performance',
    value: '33% improvement',
    context: 'Query optimization & caching',
    source: 'Cognizant — Axle Max Life Insurance project; API testing with Postman.',
  },
  {
    id: 'downtime',
    label: 'System Downtime',
    value: '28% reduction',
    context: 'Incident reduction at Cognizant',
    source: 'Cognizant — annual system downtime incidents across insurance microservices.',
  },
  {
    id: 'test-coverage',
    label: 'Test Coverage',
    value: '60+ test cases',
    context: 'JUnit & Mockito',
    source: 'Cognizant — unit and integration test suites written with Mockito and JUnit.',
  },
  {
    id: 'microservices',
    label: 'Microservices',
    value: 'Spring Cloud',
    context: 'AWS-native, event-driven',
    source: 'Cognizant — scalable microservices-based insurance applications on AWS.',
  },
]

export function getImpactMetrics(): ImpactMetric[] {
  return impactMetrics
}