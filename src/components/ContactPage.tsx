import { Mail, Phone, MapPin, Download } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/button'
import { site } from '@/data/site'
import { Reveal } from '@/hooks/useReveal'
import { SectionHeading } from '@/components/SectionHeading'
import { Badge } from '@/components/ui/badge'

export function ContactPage() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="05 / Contact"
          title="Let's Connect"
          description="Have a project, opportunity, or interesting engineering problem? I'd love to hear about it."
        />
      </Reveal>

      <Reveal delayClass="reveal-delay-1">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
              <h3 className="flex items-center gap-2 font-semibold"><Mail className="size-4 text-indigo-400" /> Email</h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">{site.email}</p>
              <a href={`mailto:${site.email}`} className="mt-4 inline-flex items-center gap-2 text-indigo-400 hover:underline">
                Send a message →
              </a>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
              <h3 className="flex items-center gap-2 font-semibold"><Phone className="size-4 text-indigo-400" /> Phone</h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">
                <a href={`tel:${site.phone}`} className="hover:text-[var(--color-fg)]">{site.phone}</a>
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
              <h3 className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-indigo-400" /> Location</h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">Himachal Pradesh, India</p>
              <p className="mt-1 text-xs text-[var(--color-fg-muted)]">Open to remote & relocation</p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={site.resumePath} target="_blank" rel="noreferrer" className={buttonClass({ size: 'lg' })}>
                <Download className="size-4" /> Download Resume
              </a>
              <a href={site.linkedin} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'outline', size: 'lg' })}>
                <LinkedInIcon className="size-4" /> LinkedIn
              </a>
              <a href={site.github} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'outline', size: 'lg' })}>
                <GitHubIcon className="size-4" /> GitHub
              </a>
              <a href={`mailto:${site.email}`} className={buttonClass({ variant: 'ghost', size: 'lg' })}>
                <Mail className="size-4" /> Email Me
              </a>
            </div>
            <p className="mt-6 text-sm text-[var(--color-fg-muted)]">
              Usually respond within 24 hours. For urgent matters, email is best.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delayClass="reveal-delay-2">
        <div className="mt-12 rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-fg-muted)]">
          <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase mb-2">Availability</p>
          <p>Open to:</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge className="text-emerald-400 border-emerald-400/30">Full-time</Badge>
            <Badge className="text-violet-400 border-violet-400/30">Contract</Badge>
            <Badge className="text-amber-400 border-amber-400/30">Consulting</Badge>
            <Badge className="text-cyan-400 border-cyan-400/30">Open Source</Badge>
          </div>
        </div>
      </Reveal>
    </section>
  )
}