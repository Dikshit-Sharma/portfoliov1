import { useEffect } from 'react'
import { site } from '@/data/site'
import { getProject } from '@/data/projects'
import type { PageRoute } from '@/lib/router'

/**
 * Per-route SEO metadata. Keeps public pages meaningful on shared links
 * without exposing any dashboard/private information.
 */
const META: Partial<Record<PageRoute, { title: string; description: string }>> = {
  home: {
    title: `${site.fullName} — Java Full Stack Developer`,
    description: site.tagline,
  },
  work: {
    title: `Work — ${site.fullName}`,
    description: 'Projects, case studies and engineering deep dives.',
  },
  lab: {
    title: `Lab — ${site.fullName}`,
    description: 'Experiments and personal engineering projects.',
  },
  experience: {
    title: `Experience — ${site.fullName}`,
    description: 'Engineering timeline and roles at Cognizant.',
  },
  now: {
    title: `Now — ${site.fullName}`,
    description: 'What I am currently building, learning, and exploring.',
  },
  knowledge: {
    title: `Knowledge — ${site.fullName}`,
    description: 'Obsidian knowledge graph and notes index.',
  },
  system: {
    title: `System — ${site.fullName}`,
    description: 'Workspace architecture, integrations, changelog and system status.',
  },
  recruiter: {
    title: `${site.fullName} — Recruiter Summary`,
    description: 'Quick 60-second overview: role, stack, experience and impact.',
  },
  contact: {
    title: `Contact — ${site.fullName}`,
    description: 'Ways to reach Dikshit Sharma.',
  },
  changelog: {
    title: `Changelog — ${site.fullName}`,
    description: 'Version history of this developer workspace.',
  },
  '404': {
    title: `Not found — ${site.fullName}`,
    description: 'This page does not exist.',
  },
}

// Desktop app routes (deep-linked via window state)
const DESKTOP_APP_META: Record<string, { title: string; description: string }> = {
  portfolio: { title: `Profile — ${site.fullName}`, description: 'Developer profile, skills, experience, education.' },
  projects: { title: `Projects — ${site.fullName}`, description: 'Projects catalog and engineering deep dives.' },
  experience: { title: `Experience — ${site.fullName}`, description: 'Professional experience timeline.' },
  lab: { title: `Lab — ${site.fullName}`, description: 'Experiments and personal engineering.' },
  terminal: { title: `Terminal — ${site.fullName}`, description: 'Interactive developer shell.' },
  knowledge: { title: `Knowledge — ${site.fullName}`, description: 'Obsidian knowledge graph and notes.' },
  architecture: { title: `Architecture — ${site.fullName}`, description: 'System inspector — architecture diagrams.' },
  github: { title: `GitHub — ${site.fullName}`, description: 'Repository and integration state.' },
  system: { title: `System — ${site.fullName}`, description: 'Environment, integrations, about.' },
  settings: { title: `Settings — ${site.fullName}`, description: 'Theme, workspace, shortcuts.' },
  contact: { title: `Contact — ${site.fullName}`, description: 'Email, phone, social links.' },
  changelog: { title: `Changelog — ${site.fullName}`, description: 'Version history.' },
  now: { title: `Now — ${site.fullName}`, description: 'Currently building, learning, experimenting.' },
  recruiter: { title: `${site.fullName} — Recruiter Summary`, description: 'Quick 60-second overview.' },
}

function setMeta(route: PageRoute, subRoute: string | null) {
  // Desktop app routes
  const desktopApp = route as string
  if (DESKTOP_APP_META[desktopApp]) {
    const meta = DESKTOP_APP_META[desktopApp]
    let title = meta.title
    if (desktopApp === 'projects' && subRoute) {
      const proj = getProject(subRoute)
      title = proj ? `${proj.name} — ${site.fullName}` : meta.title
    }
    document.title = title
    const descriptionEl = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (descriptionEl) descriptionEl.setAttribute('content', meta.description)
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    if (ogDescription) ogDescription.setAttribute('content', meta.description)
    return
  }

  const meta = META[route]
  if (!meta) return

  const title =
    route === 'work' && subRoute
      ? `${subRoute.replace(/-/g, ' ') } — ${site.fullName}`
      : meta.title

  document.title = title
  const descriptionEl = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (descriptionEl) descriptionEl.setAttribute('content', meta.description)
  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
  if (ogTitle) ogTitle.setAttribute('content', title)
  const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
  if (ogDescription) ogDescription.setAttribute('content', meta.description)
}

export function usePageMeta(route: PageRoute, subRoute: string | null): void {
  useEffect(() => {
    setMeta(route, subRoute)
  }, [route, subRoute])
}