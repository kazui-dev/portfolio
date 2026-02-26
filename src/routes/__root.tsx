import { useEffect, useLayoutEffect } from 'react';
import { HeadContent, Scripts, createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useScrollStore } from '@/store/useScrollStore';
import { ThemeProvider } from '@/lib/theme';
import { PAGE_METADATA } from '@/constants/metadata';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
      { name: 'theme-color', id: 'themeColorMeta', content: '#ffffff' },
      
      { title: PAGE_METADATA.home.title },
      { name: 'description', content: PAGE_METADATA.home.description },
      
      { property: 'og:title', content: PAGE_METADATA.home.ogTitle },
      { property: 'og:description', content: PAGE_METADATA.home.ogDescription || PAGE_METADATA.home.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://kazui.dev/' },
      { property: 'og:image', content: 'https://kazui.dev/ogp-image.png' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:image', content: 'https://kazui.dev/ogp-image.png' },
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
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
        <Header />
        <main className="flex-1 w-full md:pl-64">
          <div className="p-10 w-full max-w-4xl mx-auto md:mx-0">
            <Outlet />
          </div>
        </main>
        <Footer />
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
        isDark ? '#0f172a' : '#ffffff'
      );
    })();
  `;

  return (
    <html lang="ja">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-50 selection:bg-slate-400/30 dark:selection:bg-slate-700/30 antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}