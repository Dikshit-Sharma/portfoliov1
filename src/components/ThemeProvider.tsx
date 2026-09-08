import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    return 'system'
  } catch {
    return 'system'
  }
}

function getResolvedTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
      return 'dark'
    }
  }
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => getResolvedTheme(readTheme()))

  useEffect(() => {
    const resolved = getResolvedTheme(theme)
    setResolvedTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (newTheme: Theme) => setThemeState(newTheme)

  const toggleTheme = () => {
    setThemeState((current) => {
      if (current === 'dark') return 'light'
      if (current === 'light') return 'system'
      return 'dark'
    })
  }

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
