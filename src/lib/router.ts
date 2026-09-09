import { useState, useEffect } from 'react';

export type PageRoute =
  | 'home'
  | 'work'
  | 'lab'
  | 'now'
  | 'knowledge'
  | 'system'
  | 'recruiter'
  | 'contact'
  | 'experience'
  | 'changelog'
  | 'dashboard'
  | '404';

const PAGE_ROUTES: PageRoute[] = [
  'home',
  'work',
  'lab',
  'now',
  'knowledge',
  'system',
  'recruiter',
  'contact',
  'experience',
  'changelog',
  'dashboard',
];

function parseHash(): PageRoute {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return 'home';
  
  const parts = raw.split('/');
  const first = parts[0];
  
  if (first === 'dashboard') return 'dashboard';
  if ((PAGE_ROUTES as string[]).includes(first)) return first as PageRoute;
  
  return '404';
}

function parseSubRoute(): string | null {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return null;
  
  const parts = raw.split('/');
  if (parts[0] === 'dashboard') return parts[1] || 'overview';
  if (parts.length > 1) return parts[1];
  return null;
}

export function useHashRoute() {
  const [route, setRoute] = useState<PageRoute>(() => parseHash());
  const [subRoute, setSubRoute] = useState<string | null>(() => parseSubRoute());

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      setSubRoute(parseSubRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return { route, subRoute };
}

export function navigate(page: PageRoute, sub?: string) {
  const hash = sub ? `#/${page}/${sub}` : `#/${page}`;
  window.location.hash = hash;
}

export function navigateDashboard(sub: string) {
  window.location.hash = `#/dashboard/${sub}`;
}

export function isDashboardRoute(): boolean {
  return window.location.hash.startsWith('#/dashboard');
}

export function isHomeRoute(): boolean {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return !hash || hash === 'home';
}