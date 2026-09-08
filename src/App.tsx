import { useEffect, useState } from 'react'
import { CommandProvider } from '@/components/CommandPalette'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { WorkPage, ProjectDetailPage } from '@/components/WorkPage'
import { LabPage, LabDetailPage } from '@/components/LabPage'
import { NowPage } from '@/components/NowPage'
import { KnowledgePage } from '@/components/KnowledgePage'
import { RecruiterPage } from '@/components/RecruiterPage'
import { ContactPage } from '@/components/ContactPage'
import { ChangelogPage } from '@/components/ChangelogPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { Dashboard } from '@/dashboard/Dashboard'
import { About } from '@/components/About'
import { AmliToolsDetail } from '@/components/AmliToolsDetail'
import { Education } from '@/components/Education'
import { Experience } from '@/components/Experience'
import { Hero } from '@/components/Hero'
import { ProjectsSection } from '@/components/ProjectsSection'
import { ImpactSection } from '@/components/ImpactSection'
import { ScrollProgress } from '@/components/ScrollProgress'
import { Skills } from '@/components/Skills'
import { useHashRoute, isDashboardRoute } from '@/lib/router'

function useOnDashboard() {
  const [isDashboard, setIsDashboard] = useState(() => isDashboardRoute())
  useEffect(() => {
    const onChange = () => setIsDashboard(isDashboardRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return isDashboard
}

export default function App() {
  const [amliOpen, setAmliOpen] = useState(false)
  const isDashboard = useOnDashboard()
  const { route, subRoute } = useHashRoute()

  if (isDashboard) {
    return (
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    )
  }

  const renderPage = () => {
    switch (route) {
      case 'work':
        return subRoute ? <ProjectDetailPage projectId={subRoute} /> : <WorkPage />
      case 'lab':
        return subRoute ? <LabDetailPage projectId={subRoute} /> : <LabPage />
      case 'experience':
        return <Experience />
      case 'knowledge':
        return <KnowledgePage />
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-indigo-500 focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <Navbar />
        <main id="main">
          {renderPage()}
        </main>
        <Footer />
        <AmliToolsDetail open={amliOpen} onClose={() => setAmliOpen(false)} />
      </CommandProvider>
    </ThemeProvider>
  )
}