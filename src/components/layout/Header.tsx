import { useState, type MouseEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { House, NotebookText, Menu as MenuIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useScrollStore } from '@/store/useScrollStore';
import ThemeSelector from './ThemeSelector';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const clearScrollPosition = useScrollStore(state => state.clearScrollPosition);

  const closeMenu = () => setIsOpen(false);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      clearScrollPosition('home');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 md:z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 h-14 flex items-center">
        <div className="mx-auto flex items-center justify-between gap-3 w-full px-8">
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(true)}
            className="h-9 w-9 p-0 hover:bg-slate-200/50 active:bg-slate-200/50 dark:hover:bg-slate-800/50 dark:active:bg-slate-800/50 md:hidden [&_svg]:size-5 shrink-0"
          >
            <MenuIcon className="text-slate-700 dark:text-slate-300" />
          </Button>

          <h1 className="shrink truncate flex-1">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 hover:opacity-80 active:opacity-80 transition-opacity block"
            >
              kazui.dev
            </Link>
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeSelector />

            <nav className="grid w-24 sm:w-28 grid-cols-2 h-9 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-md text-slate-500 dark:text-slate-400">
              <Link
                to="/"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm h-full px-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
                activeProps={{ className: 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50' }}
                activeOptions={{ exact: true, includeSearch: false }}
                aria-label="Home"
              >
                <House size={16} />
              </Link>
              <Link
                to="/notes"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm h-full px-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
                activeProps={{ className: 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50' }}
                activeOptions={{ exact: false, includeSearch: false }}
                aria-label="Notes"
              >
                <NotebookText size={16} />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
        aria-hidden="true"
        aria-label="Close menu"
      />

      <aside
        className={`fixed top-0 md:top-14 left-0 h-full md:h-[calc(100vh-3.5rem)] w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 md:z-40 transition-transform duration-300 ease-in-out flex flex-col md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto flex flex-col pt-4">
          <div className="px-4 pb-2">
            <Link
              to="/"
              onClick={closeMenu}
              className="w-full mb-2 flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors text-sm font-medium hover:bg-slate-100 active:bg-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-800 text-slate-800 dark:text-slate-200"
              activeProps={{ className: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' }}
              activeOptions={{ exact: true, includeSearch: false }}
            >
              <House size={18} className="text-slate-600 dark:text-slate-300" />
              Home
            </Link>

            <Link
              to="/notes"
              onClick={closeMenu}
              className="w-full mb-2 flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors text-sm font-medium hover:bg-slate-100 active:bg-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-800 text-slate-800 dark:text-slate-200"
              activeProps={{ className: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' }}
              activeOptions={{ exact: false, includeSearch: false }}
            >
              <NotebookText size={18} className="text-slate-600 dark:text-slate-300" />
              Notes
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}