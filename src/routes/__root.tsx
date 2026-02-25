import { useEffect, useLayoutEffect } from 'react';
import { HeadContent, Scripts, createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useScrollStore } from '@/store/useScrollStore';
import Header from '@/components/layout/Header';
import { ThemeProvider } from '@/lib/theme';
import { PAGE_METADATA } from '@/constants/metadata';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/noto-sans-jp/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', id: 'themeColorMeta', content: '#fafaf8' },
      
      { title: PAGE_METADATA.home.title },
      { name: 'description', content: PAGE_METADATA.home.description },
      
      { property: 'og:title', content: PAGE_METADATA.home.ogTitle },
      { property: 'og:description', content: PAGE_METADATA.home.ogDescription || PAGE_METADATA.home.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://yamabuki.work/' },
      { property: 'og:image', content: 'https://yamabuki.work/ogp-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: 'https://yamabuki.work/ogp-image.png' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  const location = useLocation();
  const { positions, setScrollPosition } = useScrollStore();

  useEffect(() => {
    let timeoutId: number | undefined;

    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = window.setTimeout(() => {
        setScrollPosition(location.pathname, window.scrollY);
        timeoutId = undefined;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [location.pathname, setScrollPosition]);

  useLayoutEffect(() => {
    const savedPosition = positions[location.pathname];
    
    requestAnimationFrame(() => {
      if (savedPosition !== undefined) {
        window.scrollTo({ top: savedPosition, behavior: 'instant' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="p-4 sm:p-6 mb-16 flex-1 w-full max-w-md mx-auto">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const themeScript = `
    (() => {
      const storedTheme = localStorage.getItem('theme-preference');
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDark = storedTheme === 'dark' || (
        (storedTheme === 'system' || !storedTheme) && mediaQuery.matches
      );
      document.documentElement.classList.toggle('dark', isDark);
      document.getElementById('themeColorMeta')?.setAttribute(
        'content',
        isDark ? '#0f172a' : '#fafaf8'
      );
    })();
  `;

  return (
    <html lang="ja">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-slate-400/30 dark:selection:bg-slate-700/30 antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}