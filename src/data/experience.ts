export interface ExperienceEntry {
  id: string
  company: string
  title: string
  period: string
  location?: string
  type: 'full-time' | 'internship' | 'contract'
  description?: string
  bullets: string[]
  technologies: string[]
  projects?: string[]
}

export const experience: ExperienceEntry[] = [
  {
    id: 'cognizant-jr',
    company: 'Cognizant Technologies (CTS)',
    title: 'Jr. Software Engineer',
    period: 'Jun 2025 – Present',
    location: 'Remote / India',
    type: 'full-time',
    description: 'Building and maintaining scalable microservices-based applications for the insurance domain on AWS.',
    bullets: [
      'Develop and maintain scalable microservices-based applications using Java, Spring Boot, and Spring Cloud, contributing to a 28% reduction in annual system downtime incidents.',
      'Integrate AWS services including S3, Lambda, API Gateway, RDS, DynamoDB, CloudWatch, Parameter Store, and Secrets Manager to support cloud-native application development.',
      'Improved API performance by 33% through query optimization, caching strategies, and rigorous API testing using Postman.',
      'Implemented 60+ unit and integration test cases using Mockito and JUnit to improve code quality, reliability, and maintainability.',
      'Collaborate with cross-functional Agile teams to deliver scalable software solutions within sprint timelines.',
      'Participate in production support, bug fixing, performance tuning, and root-cause analysis for critical applications.',
    ],
    technologies: [
      'Java',
      'Spring Boot',
      'Spring Cloud',
      'Microservices',
      'AWS',
      'REST APIs',
      'JUnit',
      'Mockito',
      'Postman',
    ],
    projects: ['Axis Max Life Insurance'],
  },
  {
    id: 'cognizant-intern',
    company: 'Cognizant Technologies (CTS)',
    title: 'Intern',
    period: 'Feb 2025 – Jun 2025',
    location: 'Remote / India',
    type: 'internship',
    description: 'Team-based internship project building a Travel Booking System.',
    projects: ['Travel Booking System'],
    bullets: [
      'Developed a responsive Travel Booking System using HTML, CSS, JavaScript, and MySQL as part of a team-based internship project.',
      'Designed and implemented user-facing modules including login, registration, travel booking, and navigation.',
      'Integrated MySQL for application data storage and management.',
      'Implemented client-side form handling and interactive booking workflows.',
      'Built responsive and user-friendly web interfaces.',
      'Used GitHub for source-code management and collaborative development.',
    ],
    technologies: ['HTML', 'CSS', 'JavaScript', 'MySQL', 'GitHub'],
  },
]

export function getExperience(id: string): ExperienceEntry | undefined {
  return experience.find((e) => e.id === id)
}