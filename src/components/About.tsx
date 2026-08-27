import { SectionHeading } from '@/components/SectionHeading'
import { Reveal } from '@/hooks/useReveal'

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading kicker="01 / About" title="About Me" />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr]">
          <div className="space-y-4 text-[var(--color-fg-muted)] leading-relaxed">
            <p>
              I'm a Java Full Stack Developer with 1+ year of professional experience building and
              maintaining scalable applications. Most of my day-to-day work sits in Java, Spring
              Boot, Spring Security, Spring Cloud, microservices, REST APIs, and AWS — the kind of
              systems that need to stay reliable in production, not just look clean in a demo.
            </p>
            <p>
              That includes cloud-native services, API performance work, unit and integration
              tests, production support, databases, Git, and Agile delivery. I care about
              maintainable code, careful interfaces, and the unglamorous details that keep
              distributed systems honest.
            </p>
            <p>
              Outside of sprint work, I like building personal developer tools that take repetitive
              engineering workflows — documentation, credentials, encryption, tracking, analytics —
              and turn them into something faster to use. AMLI Tools came from that instinct: if a
              process is fragmented, I want to automate it.
            </p>
          </div>
          <aside className="h-fit rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
            <p className="font-mono text-xs tracking-widest text-indigo-400 uppercase">Focus</p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-fg-muted)]">
              <li>Backend engineering with Java / Spring</li>
              <li>Cloud-native services on AWS</li>
              <li>Microservices and REST APIs</li>
              <li>Developer productivity tooling</li>
            </ul>
          </aside>
        </div>
      </Reveal>
    </section>
  )
}
