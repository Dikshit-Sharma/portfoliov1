import { useState } from 'react'
import { About } from '@/components/About'
import { AmliToolsDetail } from '@/components/AmliToolsDetail'
import { CommandProvider } from '@/components/CommandPalette'
import { Contact } from '@/components/Contact'
import { Education } from '@/components/Education'
import { Experience } from '@/components/Experience'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { Navbar } from '@/components/Navbar'
import { ProjectsSection } from '@/components/ProjectsSection'
import { ScrollProgress } from '@/components/ScrollProgress'
import { Skills } from '@/components/Skills'
import { ThemeProvider } from '@/components/ThemeProvider'

export default function App() {
  const [amliOpen, setAmliOpen] = useState(false)

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
          <Hero />
          <About />
          <Skills />
          <Experience />
          <ProjectsSection onOpenAmli={() => setAmliOpen(true)} />
          <Education />
          <Contact />
        </main>
        <Footer />
        <AmliToolsDetail open={amliOpen} onClose={() => setAmliOpen(false)} />
      </CommandProvider>
    </ThemeProvider>
  )
}
