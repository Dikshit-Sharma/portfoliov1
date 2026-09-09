import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Skills } from '@/components/Skills'
import { Experience } from '@/components/Experience'
import { ProjectsSection } from '@/components/ProjectsSection'
import { Education } from '@/components/Education'
import { Contact } from '@/components/Contact'
import { ImpactSection } from '@/components/ImpactSection'

/**
 * Portfolio application — the full personal profile composed as a
 * scrollable application window.
 */
export default function PortfolioApp() {
  return (
    <div className="mx-auto max-w-6xl">
      <Hero />
      <ImpactSection />
      <About />
      <Skills />
      <Experience />
      <ProjectsSection
        onOpenAmli={() => {
          // AMLI details modal is not appropriate inside the desktop;
          // the Projects app handles deep dives instead. Keep no-op safe.
        }}
      />
      <Education />
      <Contact />
    </div>
  )
}