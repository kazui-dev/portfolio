import { type MouseEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { House, NotebookText } from "lucide-react";
import { cn } from '@/lib/utils';
import ThemeSelector from './ThemeSelector';
import SocialLinks from './SocialLinks';
import MobilePageNav from './MobilePageNav';

export default function Header() {
  const navLink = cn(
    'inline-flex items-center gap-1.5 px-1.5 py-1.5 border-b border-transparent text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950'
  );

  const navActive = cn(
    '!text-slate-800 dark:!text-slate-100 !border-slate-500/55 dark:!border-slate-400/65'
  );

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 md:z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 h-16 flex items-center">
      <div className="mx-auto flex items-center justify-between gap-3 w-full px-4 sm:px-6 md:px-12 lg:px-14">
        <h1 className="shrink truncate flex-1">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-slate-200 hover:opacity-80 active:opacity-80 transition-opacity block"
          >
            kazui.dev
          </Link>
        </h1>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <MobilePageNav />

          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-3">
              <Link
                to="/"
                className={navLink}
                activeProps={{ className: navActive }}
                activeOptions={{ exact: true, includeSearch: false }}
              >
                <House size={16} className="text-current" />
                Home
              </Link>
              <Link
                to="/notes"
                className={navLink}
                activeProps={{ className: navActive }}
                activeOptions={{ exact: false, includeSearch: false }}
              >
                <NotebookText size={16} className="text-current" />
                Notes
              </Link>
            </nav>

            <span className="h-5 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

            <ThemeSelector />

            <span className="h-5 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

            <SocialLinks className="flex items-center gap-4 text-slate-400" />
          </div>

          <div className="md:hidden">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </header>
  );
}