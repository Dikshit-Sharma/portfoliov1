import { lazy, Suspense, useEffect, useState } from 'react'
import { CommandProvider } from '@/components/CommandPalette'
import { ThemeProvider } from '@/components/ThemeProvider'
import { WorkPage, ProjectDetailPage } from '@/components/WorkPage'
import { LabPage, LabDetailPage } from '@/components/LabPage'
import { NowPage } from '@/components/NowPage'
import { RecruiterPage } from '@/components/RecruiterPage'
import { ContactPage } from '@/components/ContactPage'
import { ChangelogPage } from '@/components/ChangelogPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { SystemPage } from '@/components/SystemPage'
import { About } from '@/components/About'
import { AmliToolsDetail } from '@/components/AmliToolsDetail'
import { Education } from '@/components/Education'
import { Experience } from '@/components/Experience'
import { Hero } from '@/components/Hero'
import { ProjectsSection } from '@/components/ProjectsSection'
import { ImpactSection } from '@/components/ImpactSection'
import { Skills } from '@/components/Skills'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TopBar } from '@/components/workspace/TopBar'
import { StatusBar } from '@/components/workspace/StatusBar'
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell'
import { usePageMeta } from '@/lib/seo'
import { useHashRoute, isDashboardRoute } from '@/lib/router'

// Heavy subsystems load only when actually needed.
const Dashboard = lazy(() => import('@/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })))
const KnowledgePage = lazy(() => import('@/components/KnowledgePage').then((m) => ({ default: m.KnowledgePage })))

function useOnDashboard() {
  const [isDashboard, setIsDashboard] = useState(() => isDashboardRoute())
  useEffect(() => {
    const onChange = () => setIsDashboard(isDashboardRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return isDashboard
}

function PageLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="font-mono text-xs text-[var(--color-fg-muted)]">loading {label}…</p>
    </div>
  )
}

export default function App() {
  const [amliOpen, setAmliOpen] = useState(false)
  const isDashboard = useOnDashboard()
  const { route, subRoute } = useHashRoute()
  usePageMeta(route, subRoute)

  if (isDashboard) {
    return (
      <ThemeProvider>
        <ErrorBoundary label="dashboard">
          <Suspense fallback={<PageLoader label="control center" />}>
            <Dashboard />
          </Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    )
  }

  const renderPage = () => {
    switch (route) {
      case 'work':
        return (
          <ErrorBoundary label="projects">
            {subRoute ? <ProjectDetailPage projectId={subRoute} /> : <WorkPage />}
          </ErrorBoundary>
        )
      case 'lab':
        return (
          <ErrorBoundary label="lab">
            {subRoute ? <LabDetailPage projectId={subRoute} /> : <LabPage />}
          </ErrorBoundary>
        )
      case 'experience':
        return <Experience />
      case 'knowledge':
        return (
          <ErrorBoundary label="knowledge graph">
            <Suspense fallback={<PageLoader label="knowledge" />}>
              <KnowledgePage />
            </Suspense>
          </ErrorBoundary>
        )
      case 'system':
        return (
          <ErrorBoundary label="system">
            <SystemPage />
          </ErrorBoundary>
        )
      case 'now':
        return <NowPage />
      case 'recruiter':
        return <RecruiterPage />
      case 'contact':
        return <ContactPage />
      case 'changelog':
        return <ChangelogPage />
      case '404':
        return <NotFoundPage />
      case 'home':
      default:
        return (
          <>
            <Hero />
            <ImpactSection />
            <About />
            <Skills />
            <Experience />
            <ProjectsSection onOpenAmli={() => setAmliOpen(true)} />
            <Education />
            <ContactPage />
          </>
        )
    }
  }

  return (
    <ThemeProvider>
      <CommandProvider onOpenAmli={() => setAmliOpen(true)}>
        <WorkspaceShell>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-indigo-500 focus:px-3 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <TopBar route={route} />
          <main id="main">{renderPage()}</main>
          <StatusBar route={route} />
          <AmliToolsDetail open={amliOpen} onClose={() => setAmliOpen(false)} />
        </WorkspaceShell>
      </CommandProvider>
    </ThemeProvider>
  )
}