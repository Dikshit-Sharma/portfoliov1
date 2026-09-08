import { LayoutDashboard, Menu, Moon, Sun, Monitor, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCommand } from '@/components/CommandPalette'
import { GitHubIcon, LinkedInIcon } from '@/components/icons'
import { Button, buttonClass } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useTheme } from '@/components/ThemeProvider'
import { site } from '@/data/site'
import { navigate, navigateDashboard } from '@/lib/router'
import { cn } from '@/lib/utils'

const navLinks = [
  { page: 'work' as const, label: 'Work' },
  { page: 'lab' as const, label: 'Lab' },
  { page: 'experience' as const, label: 'Experience' },
  { page: 'knowledge' as const, label: 'Knowledge' },
  { page: 'now' as const, label: 'Now' },
] as const

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { openPalette, modKey } = useCommand()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const themeIcons = {
    dark: <Sun className="size-4" />,
    light: <Moon className="size-4" />,
    system: <Monitor className="size-4" />,
  } as const

  const themeLabels = {
    dark: 'Switch to light theme',
    light: 'Switch to system theme',
    system: 'Switch to dark theme',
  } as const

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-transparent transition-all',
        scrolled &&
          'border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_78%,transparent)] backdrop-blur-md',
      )}
    >
      <nav
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between px-4 transition-[height] sm:px-6',
          scrolled ? 'h-12' : 'h-16',
        )}
        aria-label="Primary"
      >
        <button
          type="button"
          onClick={() => navigate('home')}
          className="font-semibold tracking-tight text-[var(--color-fg)]"
        >
          {site.name}
        </button>
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.page}>
              <button
                type="button"
                onClick={() => navigate(link.page)}
                className="text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] px-2 py-1"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openPalette}
            className={cn(
              buttonClass({ variant: 'outline', size: 'sm' }),
              'mr-1 hidden items-center gap-2 font-mono text-xs md:inline-flex',
            )}
            aria-keyshortcuts="Control+K Meta+K"
            aria-label={`Open command palette, ${modKey}+K`}
          >
            Commands
            <span className="flex items-center gap-0.5">
              <Kbd>{modKey}</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ variant: 'ghost', size: 'icon' })}
            aria-label="GitHub"
          >
            <GitHubIcon className="size-4" />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ variant: 'ghost', size: 'icon' })}
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="size-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={themeLabels[theme]}
          >
            {themeIcons[theme]}
          </Button>
          <a
            href={site.resumePath}
            className={cn(buttonClass({ variant: 'outline', size: 'sm' }), 'ml-1 hidden sm:inline-flex')}
          >
            Download Resume
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigateDashboard('overview') }}
            className={cn(buttonClass({ variant: 'default', size: 'sm' }), 'ml-1 hidden sm:inline-flex')}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </nav>
      {open ? (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg)] md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="font-semibold">{site.name}</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="size-5" />
            </Button>
          </div>
          <ul className="flex flex-col gap-2 px-6 py-8">
            {navLinks.map((link) => (
              <li key={link.page}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate(link.page) }}
                  className="block py-3 text-lg text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => { setOpen(false); openPalette() }}
                className="block py-3 text-lg text-left"
              >
                Commands
              </button>
            </li>
            <li>
              <a href={site.resumePath} className="block py-3 text-lg" onClick={() => setOpen(false)}>
                Download Resume
              </a>
            </li>
            <li>
              <button
                onClick={() => { setOpen(false); navigateDashboard('overview') }}
                className="flex items-center gap-2 py-3 text-lg"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  )
}