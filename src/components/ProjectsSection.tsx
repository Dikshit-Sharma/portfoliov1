import { SectionHeading } from '@/components/SectionHeading'
import { Projects, StorySection } from '@/components/ProjectCard'
import { Reveal } from '@/hooks/useReveal'

export function ProjectsSection({ onOpenAmli }: { onOpenAmli: () => void }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="04 / Projects"
          title="What I've built"
          description="Professional systems at Cognizant, plus a personal platform for the workflows those systems left fragmented."
        />
        <Projects onOpenAmli={onOpenAmli} />
        <StorySection />
      </Reveal>
    </section>
  )
}
