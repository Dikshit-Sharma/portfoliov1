import { Mail, Phone } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/button'
import { site } from '@/data/site'
import { Reveal } from '@/hooks/useReveal'

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.18em] text-indigo-400 uppercase">06 / Contact</p>
        <p className="mt-4 max-w-xl text-[var(--color-fg-muted)]">
          Have a project, opportunity, or interesting engineering problem?
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Let's connect.</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${site.email}`} className={buttonClass({ size: 'lg' })}>
            <Mail className="size-4" />
            Email Me
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ variant: 'outline', size: 'lg' })}
          >
            <LinkedInIcon className="size-4" />
            LinkedIn
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ variant: 'outline', size: 'lg' })}
          >
            <GitHubIcon className="size-4" />
            GitHub
          </a>
        </div>
        <p className="mt-6 text-sm text-[var(--color-fg)]">{site.email}</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
          <Phone className="size-3.5" aria-hidden="true" />
          <a href={`tel:${site.phone}`} className="hover:text-[var(--color-fg)]">
            {site.phone}
          </a>
        </p>
      </Reveal>
    </section>
  )
}
