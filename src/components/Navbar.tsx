import { LayoutDashboard, Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCommand } from '@/components/CommandPalette'
import { GitHubIcon, LinkedInIcon } from '@/components/icons'
import { Button, buttonClass } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useTheme } from '@/components/ThemeProvider'
import { site } from '@/data/site'
import { cn } from '@/lib/utils'

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
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
        <a href="#top" className="font-semibold tracking-tight text-[var(--color-fg)]">
          {site.name}
        </a>
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
              >
                {link.label}
              </a>
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
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <a
            href={site.resumePath}
            className={cn(buttonClass({ variant: 'outline', size: 'sm' }), 'ml-1 hidden sm:inline-flex')}
          >
            Download Resume
          </a>
          <a
            href="#/dashboard"
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
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block py-3 text-lg"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="block py-3 text-lg"
                onClick={() => {
                  setOpen(false)
                  openPalette()
                }}
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
              <a
                href="#/dashboard"
                className="flex items-center gap-2 py-3 text-lg"
                onClick={() => setOpen(false)}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  )
}
