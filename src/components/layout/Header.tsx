import { useRef, useState, type MouseEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { House, NotebookText, Menu as MenuIcon, Sun, MoonStar, Smartphone, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '@/lib/theme';
import { useScrollStore } from '@/store/useScrollStore';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollTopRef = useRef(0);
  const { theme, resolvedTheme, setTheme } = useTheme();

  const clearScrollPosition = useScrollStore(state => state.clearScrollPosition);

  const closeMenu = () => {
    if (scrollContainerRef.current) {
      scrollTopRef.current = scrollContainerRef.current.scrollTop;
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeMenu();
      return;
    }
    setIsOpen(true);
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollTopRef.current;
      }
    });
  };

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }else {
      clearScrollPosition('home');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        
        <Drawer direction="left" open={isOpen} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 p-0 hover:bg-slate-200/50 active:bg-slate-200/50 dark:hover:bg-slate-800/50 dark:active:bg-slate-800/50 [&_svg]:size-5">
              <MenuIcon className="text-slate-700 dark:text-slate-300" />
            </Button>
          </DrawerTrigger>

          <DrawerContent direction="left" className="w-64 p-0">
            <div className="h-full flex flex-col overflow-hidden">
              <div className="px-4 pt-4 pb-2">
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
                  to="/blog"
                  onClick={closeMenu}
                  className="w-full mb-2 flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors text-sm font-medium hover:bg-slate-100 active:bg-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-800 text-slate-800 dark:text-slate-200"
                  activeProps={{ className: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' }}
                  activeOptions={{ exact: false, includeSearch: false }}
                >
                  <NotebookText size={18} className="text-slate-600 dark:text-slate-300" />
                  Blog
                </Link>
              </div>

              <div className="px-4 pt-2 pb-4">
                <div className="h-px bg-slate-200 dark:bg-slate-700 mt-0 mb-2" />
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full flex items-center gap-1.5 px-4 py-3 rounded-lg hover:bg-slate-100 active:bg-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-800 transition-colors text-slate-800 dark:text-slate-200 text-sm font-medium">
                      {resolvedTheme === 'dark' ? <><MoonStar size={18} className="text-slate-600 dark:text-slate-300" />ダークモード</> : <><Sun size={18} className="text-slate-600 dark:text-slate-300" />ライトモード</>}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" side="top" align="start">
                    <div className="space-y-1">
                      {[
                        { themeValue: 'light' as const, icon: Sun, label: 'ライトモード' },
                        { themeValue: 'dark' as const, icon: MoonStar, label: 'ダークモード' },
                        { themeValue: 'system' as const, icon: Smartphone, label: '端末の設定を使う' },
                      ].map(({ themeValue, icon: Icon, label }) => (
                        <button
                          key={themeValue}
                          onClick={() => setTheme(themeValue)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 active:bg-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-800 transition-colors"
                          aria-current={theme === themeValue ? 'true' : undefined}
                        >
                          <Icon size={18} className="text-slate-600 dark:text-slate-300" />
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1 text-left">{label}</span>
                          {theme === themeValue && <Check size={16} className="text-slate-600 dark:text-slate-300" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <h1 className="shrink truncate flex-1">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 hover:opacity-80 active:opacity-80 transition-opacity block"
          >
            kazui.dev
          </Link>
        </h1>
        
        <div className="w-24 sm:w-28 shrink-0">
          <nav className="grid w-full grid-cols-2 h-9 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-md text-slate-500 dark:text-slate-400">
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
              to="/blog"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm h-full px-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
              activeProps={{ className: 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50' }}
              activeOptions={{ exact: false, includeSearch: false }}
              aria-label="Blog"
            >
              <NotebookText size={16} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}